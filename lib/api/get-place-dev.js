var data = require('../test-data')

module.exports = function(place, callback) {
	data.places(place, function(err, d) { callback(err,d) })
}
