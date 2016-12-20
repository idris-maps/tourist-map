var get = require('../utils/get-json')
var createUrl = require('./create-url')

module.exports = function(bbox, keyVals, timeout, callback) {
	var url = createUrl(bbox, keyVals, timeout)
	get(url, function(err, data) {
		if(err) { callback(err) }
		else {
			callback(null, data)
		}
	})
}
