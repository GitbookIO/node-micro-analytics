var should = require('should');
var Analytics = require('../index.js');
var config = require('./config.json');

var analytics = new Analytics(config.HOST);
var DBNAME = 'test-client';
var FAKE_DBNAME = 'test-client2';
var params = {
    "start": new Date(2000, 0, 1),
    "end": new Date()
};
var intervalParams = {
    "start": new Date(1950, 0, 1),
    "end": new Date(1951, 0, 1),
    "interval": 3600
};

describe('analytics.delete()', function () {
    it('should delete a DB, wheter it exists or not', function(done) {
        return analytics.delete(DBNAME)
        .then(function() {
            done();
        }, function(err) {
            err = err || new Error();
            done(err);
        });
    });
});

describe('analytics.push()', function () {
    it('should insert data in a new DB', function(done) {
        // countryCode will be 'gb', platform will be 'Mac'
        var data = {
            "ip":"212.58.244.20",
            "event":"pdf",
            "path":"/somewhere",
            "headers": {
                "host": "localhost:7000",
                "connection": "keep-alive",
                "content-length": "111",
                "cache-control": "no-cache",
                "origin": "chrome-extension://fhbjgbiflinjbdggehcddcbncdddomop",
                "referer": "http://gitbook.com",
                "content-type": "application/json",
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36"
            }
        };

        analytics.push(DBNAME, data)
        .then(function() {
            done();
        }, function(err) {
            err = err || new Error();
            done(err);
        });
    });

    it('should insert data in an existing DB', function(done) {
        // countryCode will be 'jp', platform will be 'Windows'
        var data = {
            "time": new Date(1950, 0, 1),
            "ip":"14.133.244.23",
            "event":"download",
            "path":"/somewhereelse",
            "headers": {
                "host": "localhost:7000",
                "connection": "keep-alive",
                "content-length": "111",
                "cache-control": "no-cache",
                "origin": "chrome-extension://fhbjgbiflinjbdggehcddcbncdddomop",
                "referer": "http://gitbook.io",
                "content-type": "application/json",
                "user-agent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:25.0; Avant TriCore) Gecko/20100101 Firefox/25.0"
            }
        };

        analytics.push(DBNAME, data)
        .then(function() {
            done();
        }, function(err) {
            err = err || new Error();
            done(err);
        });
    });
});

describe('analytics.list()', function () {
    it('should return the list of all analytics in the DB', function(done) {
        analytics.list(DBNAME)
        .then(function(analytics) {
            (analytics.list.length).should.be.exactly(2);
            done();
        }, function(err) {
            err = err || new Error();
            done(err);
        });
    });

    it('should return the list of analytics in the DB between two dates', function(done) {
        analytics.list(DBNAME, params)
        .then(function(analytics) {
            (analytics.list.length).should.be.exactly(1);
            done();
        }, function(err) {
            err = err || new Error();
            done(err);
        });
    });

    it('should fail when querying an inexistant DB', function(done) {
        analytics.list(FAKE_DBNAME, params)
        .then(function(analytics) {
            e = new Error();
            done(e);
        }, function(err) {
            done();
        });
    });
});

describe('analytics.byCountries()', function () {
    it('should return aggregated analytics by countries', function(done) {
        analytics.byCountries(DBNAME)
        .then(function(analytics) {
            (analytics.list.length).should.be.exactly(2);
            done();
        }, function(err) {
            err = err || new Error();
            done(err);
        });
    });

    it('should return aggregated analytics by countries between two dates', function(done) {
        analytics.byCountries(DBNAME, params)
        .then(function(analytics) {
            (analytics.list.length).should.be.exactly(1);
            (analytics.list[0]).should.containEql({ 'id': 'gb' });
            done();
        }, function(err) {
            err = err || new Error();
            done(err);
        });
    });
});

describe('analytics.byPlatforms()', function () {
    it('should return aggregated analytics by platforms', function(done) {
        analytics.byCountries(DBNAME)
        .then(function(analytics) {
            (analytics.list.length).should.be.exactly(2);
            done();
        }, function(err) {
            err = err || new Error();
            done(err);
        });
    });

    it('should return aggregated analytics by platforms between two dates', function(done) {
        analytics.byPlatforms(DBNAME, params)
        .then(function(analytics) {
            (analytics.list.length).should.be.exactly(1);
            (analytics.list[0]).should.containEql({ 'id': 'Mac' });
            done();
        }, function(err) {
            err = err || new Error();
            done(err);
        });
    });
});

describe('analytics.byDomains()', function () {
    it('should return aggregated analytics by referer domains', function(done) {
        analytics.byDomains(DBNAME)
        .then(function(analytics) {
            (analytics.list.length).should.be.exactly(2);
            done();
        }, function(err) {
            err = err || new Error();
            done(err);
        });
    });

    it('should return aggregated analytics by referer domains between two dates', function(done) {
        analytics.byDomains(DBNAME, params)
        .then(function(analytics) {
            (analytics.list.length).should.be.exactly(1);
            (analytics.list[0]).should.containEql({ 'id': 'gitbook.com' });
            done();
        }, function(err) {
            err = err || new Error();
            done(err);
        });
    });
});

describe('analytics.byEvents()', function () {
    it('should return aggregated analytics by events', function(done) {
        analytics.byEvents(DBNAME)
        .then(function(analytics) {
            (analytics.list.length).should.be.exactly(2);
            done();
        }, function(err) {
            err = err || new Error();
            done(err);
        });
    });

    it('should return aggregated analytics by events between two dates', function(done) {
        analytics.byEvents(DBNAME, params)
        .then(function(analytics) {
            (analytics.list.length).should.be.exactly(1);
            (analytics.list[0]).should.containEql({ 'id': 'pdf' });
            done();
        }, function(err) {
            err = err || new Error();
            done(err);
        });
    });
});

describe('analytics.overTime()', function () {
    it('should return an analytics time serie', function(done) {
        analytics.overTime(DBNAME)
        .then(function(analytics) {
            (analytics.list.length).should.be.exactly(2);
            done();
        }, function(err) {
            err = err || new Error();
            done(err);
        });
    });

    it('should return an analytics time serie between two dates', function(done) {
        analytics.overTime(DBNAME, params)
        .then(function(analytics) {
            (analytics.list.length).should.be.exactly(1);

            var start = new Date(analytics.list[0].start);
            var predictedStart = new Date();
            (start.getFullYear()).should.be.exactly(predictedStart.getFullYear());
            (start.getMonth()).should.be.exactly(predictedStart.getMonth());
            (start.getDate()).should.be.exactly(predictedStart.getDate());

            done();
        }, function(err) {
            err = err || new Error();
            done(err);
        });
    });

    it('should return an analytics time serie between two dates with an interval specified', function(done) {
        analytics.overTime(DBNAME, intervalParams)
        .then(function(analytics) {
            (analytics.list.length).should.be.exactly(1);

            var end = new Date(analytics.list[0].end);
            var predictedEnd = new Date(1950, 0, 1, 1);
            (end.toISOString()).should.be.exactly(predictedEnd.toISOString());

            done();
        }, function(err) {
            err = err || new Error();
            done(err);
        });
    });
});
