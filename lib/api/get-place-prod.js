var read = require('./place/parse')
var get = require('./utils/get-json')

module.exports = function(place, callback) {
	var url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + place
	get(url, function(err, data) {
		if(err) { callback(err) }
		else {
			callback(null, read(data))
		}
	})
}
