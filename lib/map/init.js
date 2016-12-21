var createIcons = require('./create-icons')
var createLayer = require('./create-layer')

module.exports = function(divId, pt, config) {
	var evt = config.evt
	var mapData = { layers: {}, data: {}, icons: createIcons() }
	var map = L.map(divId)
	map.setView(new L.LatLng(pt[1], pt[0]), 15)
	mapData.map = map
	config.mapData = mapData

	var tiles = L.tileLayer('http://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	attribution: 'Imagery from <a href="http://mapbox.com/about/maps/">MapBox</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd',
	id: 'mapbox.streets',
	accessToken: 'pk.eyJ1IjoiYW5kZXJzLWlkcmlzLW1hcHMiLCJhIjoiY2l3eGt0cDExMDFmcjJ6bHFoenh5YnpycSJ9.bqmpIY7CFFIOl7vgILaV0A'}).addTo(map)

	evt.on('tourism-data', function(data) {
		mapData.data['tourism'] = data
		rmLayers(mapData, function() {
			createLayer(mapData, 'tourism')
		})
	})
	evt.on('drink-data', function(data) {
		mapData.data['drink'] = data
		rmLayers(mapData, function() {
			createLayer(mapData, 'drink')
		})	})
	evt.on('eat-data', function(data) {
		mapData.data['eat'] = data
		rmLayers(mapData, function() {
			createLayer(mapData, 'eat')
		})
	})
	evt.on('show-tourism-data', function() {
		rmLayers(mapData, function() {
			createLayer(mapData, 'tourism')
		})
	})
	evt.on('show-drink-data', function() {
		rmLayers(mapData, function() {
			createLayer(mapData, 'drink')
		})
	})
	evt.on('show-eat-data', function() {
		rmLayers(mapData, function() {
			createLayer(mapData, 'eat')
		})
	})
}

function rmLayers(mapData, callback) {
	for(k in mapData.layers) {
		mapData.map.removeLayer(mapData.layers[k])
	}
	mapData.layers = {}
	callback()
}
