/**
 * Normalize data before executing a request
 * - Flatten headers as a string
 *
 * @param  {Object} data
 * @return {Object}
 */
function normalizeData(data) {
    // Flatten possible array headers
    for (header in data.headers) {
        var value = data.headers[header];

        // Is an array ?
        if (Object.prototype.toString.call(value) == '[object Array]') {
            data.headers[header] = value.join(',');
        }
    }

    return data;
}

function normalizeBulkData(data) {
    data.list = data.list.map(function(d) {
        return normalizeData(d);
    });

    return data;
}

module.exports      = normalizeData;
module.exports.bulk = normalizeBulkData;
