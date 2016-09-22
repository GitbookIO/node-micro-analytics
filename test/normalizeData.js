var should = require('should');

var normalizeData = require('../lib/normalizeData');

describe.only('normalizeData', function() {
    it('should flatten an header as an array', function() {
        var data = {
            headers: {
                ETag: ['01234', '56789']
            }
        };

        var normalized = {
            headers: {
                ETag: '01234,56789'
            }
        };

        return should.deepEqual(normalizeData(data), normalized);
    });

    it('should handle string format headers', function() {
        var data = {
            headers: {
                ETag:              ['01234', '56789'],
                'X-Forwarded-For': '192.0.0.1'
            }
        };

        var normalized = {
            headers: {
                ETag:              '01234,56789',
                'X-Forwarded-For': '192.0.0.1'
            }
        };

        return should.deepEqual(normalizeData(data), normalized);
    });

    it('should normalize bulk data', function() {
        var data = {
            list: [
                {
                    headers: {
                        ETag:              ['01234', '56789'],
                        'X-Forwarded-For': '192.0.0.1'
                    }
                },
                {
                    headers: {
                        ETag:              ['98765', '43210'],
                        'X-Forwarded-For': '127.0.0.1'
                    }
                }
            ]
        };

        var normalized = {
            list: [
                {
                    headers: {
                        ETag:              '01234,56789',
                        'X-Forwarded-For': '192.0.0.1'
                    }
                },
                {
                    headers: {
                        ETag:              '98765,43210',
                        'X-Forwarded-For': '127.0.0.1'
                    }
                }
            ]
        };

        return should.deepEqual(normalizeData.bulk(data), normalized);
    });
});
