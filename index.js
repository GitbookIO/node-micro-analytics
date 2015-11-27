var _ = require('lodash');
var axios = require('axios');
var Q = require('Q');
var urljoin = require('urljoin.js');

function Analytics(host) {
    this.host = host;
}

Analytics.prototype.queryByProperty = function(dbName, params, property) {
    var d = Q.defer();

    // Construct base query URL
    var queryUrl = urljoin(this.host, dbName);
    if (!!property) queryUrl = urljoin(queryUrl, property);

    params = _.defaults(params || {}, {
        start: null,
        end: null,
        interval: null
    });

    // Insert query parameters
    var queryParams = {
        start: params.start? params.start.toISOString() : null,
        end: params.end? params.end.toISOString() : null,
        interval: params.interval
    };
    var queryString = encodeQueryParams(queryParams);

    if (!!queryString) queryUrl += '?'+queryString;

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

function encodeQueryParams(data) {
    return Object.keys(data)
    .filter(function(key) {
        return !!data[key];
    })
    .map(function(key) {
        return [key, data[key]].map(encodeURIComponent).join('=');
    }).join('&');
}

module.exports = Analytics;