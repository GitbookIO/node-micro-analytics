var _ = require('lodash');
var request = require('request');
var Q = require('q');
var url = require('url');
var urljoin = require('urljoin.js');
var querystring = require('querystring');

// Normalize an axios response error
function normError(response) {
    var data = response.body || {};
    var err = new Error(data.message || 'Error with micro-analytics request');
    err.body = data;
    err.code = data.code;
    return err;
}

function Analytics(host, opts) {
    if (!host || !_.isString(host)) {
        throw new Error("First argument for micro-analytics is mandatory and should be a string");
    }

    this.host = host;
    this.opts = _.defaults(opts || {}, {
        cacheExpire: 3600,
        username: null,
        password: null
    });

    var parsed = url.parse(host);
    if (parsed.auth) {
        var authParse = parsed.auth.split(':');
        this.opts.username = this.opts.username || authParse[0];
        this.opts.password = this.opts.password || authParse[1];
    }

    var requestOpts = {};

    if (!!this.opts.username) {
        requestOpts.auth = {
            'user': this.opts.username,
            'pass': this.opts.password,
            'sendImmediately': true
        };
    }

    this.request = request.defaults(requestOpts)
}

Analytics.prototype.req = function(httpMethod, method, body) {
    var d = Q.defer();
    var uri = urljoin(this.host, method);
    httpMethod = httpMethod.toUpperCase();

    if (httpMethod == 'GET' && body) {
        uri += '?'+querystring.stringify(body);
        body = undefined;
    }

    this.request({
        uri: uri,
        json: true,
        method: httpMethod,
        body: body
    }, function(err, res, data) {
        var ok = !err && res && Math.floor(res.statusCode/200) === 1;
        if (ok) return d.resolve(data);
        if (!err) err = normError(res);
        d.reject(err);
    })


    return d.promise;
};

Analytics.prototype.queryByProperty = function(dbName, params, property) {
    // Construct base query URL
    var queryUrl = dbName;
    if (!!property) queryUrl = urljoin(queryUrl, property);

    params = _.defaults(params || {}, {
        start: null,
        end: null,
        interval: null,
        unique: null
    });

    // Insert query parameters
    var queryParams = _.defaults({
        start: params.start? params.start.toISOString() : null,
        end: params.end? params.end.toISOString() : null,
        interval: params.interval,
        unique: params.unique
    }, {
        cacheExpire: this.opts.cacheExpire
    });

    if (queryParams.cacheExpire) {
        queryParams.cache = Math.floor(Date.now() / (queryParams.cacheExpire*1000)) * queryParams.cacheExpire;
        delete queryParams.cacheExpire;
    }

    queryParams = _.pick(queryParams, function(value) { return !!value; });

    // GET request to µAnalytics
    return this.req('get', queryUrl, queryParams);
};

Analytics.prototype.list = function(dbName, params) {
    return this.queryByProperty(dbName, params);
};

Analytics.prototype.byCountries = function(dbName, params) {
    return this.queryByProperty(dbName, params, 'countries');
};

Analytics.prototype.byDomains = function(dbName, params) {
    return this.queryByProperty(dbName, params, 'domains');
};

Analytics.prototype.byEvents = function(dbName, params) {
    return this.queryByProperty(dbName, params, 'events');
};

Analytics.prototype.byPlatforms = function(dbName, params) {
    return this.queryByProperty(dbName, params, 'platforms');
};

Analytics.prototype.overTime = function(dbName, params) {
    return this.queryByProperty(dbName, params, 'time');
};

Analytics.prototype.count = function(dbName, params) {
    return this.queryByProperty(dbName, params, 'count');
};

Analytics.prototype.push = function(dbName, data) {
    return this.req('post', dbName, data);
};

Analytics.prototype.bulk = function(dbName, data) {
    var queryUrl = urljoin(dbName, 'bulk');

    return this.req('post', queryUrl, data);
};

Analytics.prototype.bulkMulti = function(data) {
    return this.req('post', 'bulk', data);
};

Analytics.prototype.delete = function(dbName) {
    return this.req('delete', dbName);
};

Analytics.prototype.ping = function() {
    return this.req('get', '/')
    .then(function(data) {
        if (!data.message) throw new Error('Invalid response from micro-analytics server');
    });
};

module.exports = Analytics;
