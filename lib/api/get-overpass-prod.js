var config = require('./overpass/config')
var km = config.radius
var timeout = config.timeout
var createBbox = require('./utils/bbox-km')
var createUrl = require('./overpass/create-url')
var get = require('./utils/get-json')
var pars = require('./overpass/parse')

module.exports = function(pt, type, callback) {
	if(type==='tourism') {
		var url = createUrl(createBbox(pt, km), config.tourism(), timeout)
		get(url, function(err, data) {
			if(err) { callback(err) }
			else { callback(null, pars.tourism(data)) }
		})
	} else if(type==='drink') {
		var url = createUrl(createBbox(pt, km), config.drink(), timeout)
		get(url, function(err, data) {
			if(err) { callback(err) }
			else { callback(null, pars.drink(data)) }
		})
	} else if(type==='eat') {
		var url = createUrl(createBbox(pt, km), config.eat(), timeout)
		get(url, function(err, data) {
			if(err) { callback(err) }
			else { callback(null, pars.eat(data)) }
		})
	} else {
		callback(type + ' is not a valid type')
	}
}

