# micro-analytics

A small promise-based node client library for the [µAnalytics](https://github.com/GitbookIO/micro-analytics) service.


## Install

```
$ npm install micro-analytics
```


## Test

To test the client, set the client host in the `/test/config.json` file :

```JavaScript
{
    "HOST": "http://localhost:7070"
}
```

Then simply run the tests :

```
$ npm test
```


## Use

### Create a client

To create a new client, you need to specify the µAnalytics host as a *string*.

```JavaScript
var Analytics = require('micro-analytics');

var HOST = 'http://localhost:7070';
var analytics = new Analytics(HOST);
```

You can specify your credentials for µAnalytics basic authentication in an optional object passed as a second argument :

```JavaScript
var Analytics = require('micro-analytics');

var HOST = 'http://localhost:7070';
var opts = {
  username: 'johan',
  password: 'myPass'
};

var analytics = new Analytics(HOST, opts);
```

By default, the client will use a cache key renewed each hour. You can set the cache interval using the `cacheExpire` key of the optional second argument. The value is the interval in seconds.

```JavaScript
var Analytics = require('micro-analytics');

var HOST = 'http://localhost:7070';
var opts = {
  cacheExpire: 86400 // One day
};

var analytics = new Analytics(HOST, opts);
```

### Get data from a database

All requests for data can be passed a parameters object to query over a time range :

```JavaScript
var params = {
    start: new Date(2015, 0, 1),
    end: new Date(2015, 2, 1)
};
```

#### Get complete analytics

```JavaScript
// Full query
analytics.list(DBNAME)
.then(function(result) {
    // result.list is an array containing the whole DB
    ...
});

// Example with optional time range
// The same applies for all data requests
analytics.list(DBNAME, params)
.then(function(result) { ... });
```

A full description for `result` can be found [here](https://github.com/GitbookIO/micro-analytics#get-website).

#### Get the count of analytics

```JavaScript
analytics.count(DBNAME)
.then(function(result) {
    // result looks like { total: 300, unique: 150 }
    ...
});
```

A full description for `result` can be found [here](https://github.com/GitbookIO/micro-analytics#get-websitecount).

#### Get aggregated analytics by countries

```JavaScript
analytics.byCountries(DBNAME)
.then(function(countries) {
    // result.list is an array of aggregated analytics
    ...
});
```

A full description for `countries` can be found [here](https://github.com/GitbookIO/micro-analytics#get-websitecountries).

#### Get aggregated analytics by platforms

```JavaScript
analytics.byPlatforms(DBNAME)
.then(function(platforms) { ... });
```

A full description for `platforms` can be found [here](https://github.com/GitbookIO/micro-analytics#get-websiteplatforms).

#### Get aggregated analytics by domains

```JavaScript
analytics.byDomains(DBNAME)
.then(function(domains) { ... });
```

A full description for `domains` can be found [here](https://github.com/GitbookIO/micro-analytics#get-websitedomains).

#### Get aggregated analytics by events

```JavaScript
analytics.byEvents(DBNAME)
.then(function(events) { ... });
```

A full description for `events` can be found [here](https://github.com/GitbookIO/micro-analytics#get-websiteevents).

#### Get aggregated analytics as a time serie

With `overTime()`, the parameter object can take an `interval` key to specify the time serie interval in seconds. By default, the service sets the interval to `86400` (which is equal to one day).

```JavaScript
// Full query
analytics.overTime(DBNAME)
.then(function(timeSerie) { ... });

// With parameters
var params = {
    start: new Date(2015, 0, 1),
    end: new Date(2015, 2, 1),
    interval: 2592000 // one month
};

analytics.overTime(DBNAME, params)
.then(function(timeSerie) { ... });
```

A full description for `timeSerie` can be found [here](https://github.com/GitbookIO/micro-analytics#get-websitetime).


### Insert data in a database

#### Simple insert

```JavaScript
var data = {
    "time": new Date(), // optional
    "ip": "127.0.0.1",
    "event": "download",
    "path": "/somewhere",
    "headers": {
        "referer": "http://gitbook.com",
        "user-agent": "...",
        ...
    }
};

analytics.push(DBNAME, data)
.then(function() { ... });
```

#### Bulk insert

If you need to push a list of existing analytics, use this method:

```JavaScript
var data = {
    "list": [
        {
            "time": 1450098642,
            "ip": "127.0.0.1",
            "event": "download",
            "path": "/somewhere",
            "platform": "Apple Mac",
            "refererDomain": "www.gitbook.com",
            "countryCode": "fr"
        },
        {
            "time": 0,
            "ip": "127.0.0.1",
            "event": "login",
            "path": "/someplace",
            "platform": "Linux",
            "refererDomain": "www.gitbook.com",
            "countryCode": "us"
        }
    ]
};

analytics.bulk(DBNAME, data)
.then(function() { ... });
```

The passed `time` value must be a Unix timestamp in sec.
The `countryCode` will be reprocessed by the service based on the `ip`.

#### Multi-website bulk insert

If you need to push analytics for different websites, you can use:

```JavaScript
var data = {
    "list": [
        {
            "website": "website-1.com",
            "time": 1450098642,
            "ip": "127.0.0.1",
            "event": "download",
            "path": "/somewhere",
            "platform": "Apple Mac",
            "refererDomain": "www.gitbook.com",
            "countryCode": "fr"
        },
        {
            "website": "website-2.com",
            "time": 0,
            "ip": "127.0.0.1",
            "event": "login",
            "path": "/someplace",
            "platform": "Linux",
            "refererDomain": "www.gitbook.com",
            "countryCode": "us"
        }
    ]
};

analytics.bulkMulti(DBNAME, data)
.then(function() { ... });
```

### Delete a database

```JavaScript
analytics.delete(DBNAME)
.then(function() { ... });
```

### Auto Bulk Insert

THis module provides a small utility to easily bulk insert from multiple calls:

```JavaScript
var bulk = new Analytics.BulkInsert(analytics, {
    // Flush after N elements
    flushAt: 100,

    // Max duration to wait (in ms)
    flushAfter: 10000
});

bulk.push('MYDB', data);
...
bulk.push('MYDB', data);
```

