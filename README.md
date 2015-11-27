# node-analytics

A small promise-based node client library for the [µAnalytics](https://github.com/GitbookIO/analytics) service.


## Install

```
$ npm install node-analytics
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
var Analytics = require('node-analytics');

var HOST = 'http://localhost:7070';
var analytics = new Analytics(HOST);
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

A full description for `result` can be found [here](https://github.com/GitbookIO/analytics#get-website).


#### Get aggregated analytics by countries

```JavaScript
analytics.byCountries(DBNAME)
.then(function(countries) {
    // result.list is an array of aggregated analytics
    ...
});
```

A full description for `countries` can be found [here](https://github.com/GitbookIO/analytics#get-websitecountries).

#### Get aggregated analytics by platforms

```JavaScript
analytics.byPlatforms(DBNAME)
.then(function(platforms) { ... });
```

A full description for `platforms` can be found [here](https://github.com/GitbookIO/analytics#get-websiteplatforms).

#### Get aggregated analytics by domains

```JavaScript
analytics.byDomains(DBNAME)
.then(function(domains) { ... });
```

A full description for `domains` can be found [here](https://github.com/GitbookIO/analytics#get-websitedomains).

#### Get aggregated analytics by events

```JavaScript
analytics.byEvents(DBNAME)
.then(function(events) { ... });
```

A full description for `events` can be found [here](https://github.com/GitbookIO/analytics#get-websiteevents).

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

A full description for `timeSerie` can be found [here](https://github.com/GitbookIO/analytics#get-websitetime).


### Insert data in a database

```JavaScript
var data = {
    "time": new Date(), // optional
    "ip":"127.0.0.1",
    "event":"download",
    "path":"/somewhere",
    "headers": {
        "referer": "http://gitbook.com",
        "user-agent": "...",
        ...
    }
};

analytics.push(DBNAME, data)
.then(function() { ... });
```


### Delete a database

```JavaScript
analytics.delete(DBNAME)
.then(function() { ... });
```