var _ = require('lodash');
var Q = require('q');

function BulkInsert(client, options) {
    this.client = client;
    this.options = _.defaults(options || {}, {
        // Flush after N elements
        flushAt: 100,

        // Max duration to wait (in ms)
        flushAfter: 10000,

        // Function to call for each flush
        onFlush: null
    });
    this.queue = [];
}

// Add an entry to the queue
BulkInsert.prototype.push = function(dbName, data) {
    data.website = dbName;
    this.queue.push(data);

    if (this.queue.length >= this.options.flushAt) this.flush();
    if (this.timer) clearTimeout(this.timer);
    if (this.options.flushAfter) this.timer = setTimeout(this.flush.bind(this), this.options.flushAfter);
};

// Flush queue to server
BulkInsert.prototype.flush = function() {
    if (!this.queue.length) return Q();

    var items = this.queue.splice(0, this.options.flushAt);
    var p = this.client.bulkMulti({
        list: items
    });
    if (this.options.onFlush) this.options.onFlush(items, p);
};


module.exports = BulkInsert;
