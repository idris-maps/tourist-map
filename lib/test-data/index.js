var places = require('./places.json')
var tourism = require('./tourism.json')
var eat = require('./eat.json')
var drink = require('./drink.json')

exports.places = function(n, callback) {
	console.log('gets place: "' + n + '"')
	setTimeout(function() {
		callback(null, places)
	},2000)
}

exports.overpass = function(pt, type, callback) {
	console.log('gets overpass point: "' + pt.toString() + '" and type: "' + type + '"' )
	if(type === 'tourism') { setTimeout(function() { callback(null, tourism) },2000) }
	if(type === 'eat') { setTimeout(function() { callback(null, eat) },2000) }
	if(type === 'drink') { setTimeout(function() {callback(null, drink) },2000) }
}
