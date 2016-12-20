var createIcons = require('./create-icons')
var createLayer = require('./create-layer')

module.exports = function(divId, pt, config) {
	var evt = config.evt
	var mapData = { layers: {}, data: {}, icons: createIcons() }
	var map = L.map(divId)
	map.setView(new L.LatLng(pt[1], pt[0]), 14)
	mapData.map = map
	config.mapData = mapData
/*
	var tiles = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map)
*/
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
