var _ = require('lodash');
var axios = require('axios');
var Q = require('Q');
var querystring = require('querystring');
var urljoin = require('urljoin.js');

function Analytics(host, opts) {
    this.host = host;
    this.opts = _.defaults(opts || {}, {
        cacheExpire: 3600
    });
}

Analytics.prototype.queryByProperty = function(dbName, params, property) {
    var d = Q.defer();

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
    axios.get(queryUrl)
    .then(function(response) {
        d.resolve(response.data);
    })
    .catch(function(response) {
        console.error('Error querying DB '+dbName);
        d.reject(response.data);
    });

    return d.promise;
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
    var d = Q.defer();

    // Construct base query URL
    var queryUrl = urljoin(this.host, dbName);

    axios.post(queryUrl, data)
    .then(function(response) {
        d.resolve();
    })
    .catch(function(response) {
        console.error('Error inserting analytic into DB '+dbName);
        d.reject(response.data);
    });

    return d.promise;
};

Analytics.prototype.special = function(dbName, data) {
    var d = Q.defer();

    // Construct base query URL
    var queryUrl = urljoin(this.host, dbName, 'special');

    axios.post(queryUrl, data)
    .then(function(response) {
        d.resolve();
    })
    .catch(function(response) {
        console.error('Error inserting analytic into DB '+dbName);
        console.error(response);
        d.reject(response.data);
    });

    return d.promise;
};

Analytics.prototype.delete = function(dbName) {
    var d = Q.defer();

    // Construct base query URL
    var queryUrl = urljoin(this.host, dbName);

    axios.delete(queryUrl)
    .then(function(response) {
        d.resolve();
    })
    .catch(function(response) {
        console.error('Error deleting DB '+dbName);
        d.reject(response.data);
    });

    return d.promise;
};

module.exports = Analytics;
