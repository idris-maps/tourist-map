var data = require('../test-data')

module.exports = function(pt, type, callback) {
	data.overpass(pt, type, function(err, d) { callback(err,d) })
}
