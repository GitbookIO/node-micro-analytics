var _ = require('lodash');
var axios = require('axios');
var Q = require('Q');
var querystring = require('querystring');
var urljoin = require('urljoin.js');

// Normalize an axios response error
function normError(response) {
    var err = new Error('Error with micro-analytics request');
    err.body = response.data;
    throw err;
}

// Bind an axios request
function bindResponse(q) {
    return Q(q)
    .get('data')
    .fail(normError);
}

function Analytics(host, opts) {
    this.host = host;
    this.opts = _.defaults(opts || {}, {
        cacheExpire: 3600
    });
}

Analytics.prototype.queryByProperty = function(dbName, params, property) {
    // Construct base query URL
    var queryUrl = urljoin(this.host, dbName);
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

    var queryString = querystring.stringify(queryParams);
    if (queryString) queryUrl += '?'+queryString;

    // GET request to µAnalytics
    return bindResponse(axios.get(queryUrl));
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

Analytics.prototype.push = function(dbName, data) {
    // Construct base query URL
    var queryUrl = urljoin(this.host, dbName);

    return bindResponse(axios.post(queryUrl, data));
};

Analytics.prototype.special = function(dbName, data) {
    // Construct base query URL
    var queryUrl = urljoin(this.host, dbName, 'special');

    return bindResponse(axios.post(queryUrl, data));
};

Analytics.prototype.delete = function(dbName) {
    // Construct base query URL
    var queryUrl = urljoin(this.host, dbName);

    return bindResponse(axios.delete(queryUrl));
};

module.exports = Analytics;
