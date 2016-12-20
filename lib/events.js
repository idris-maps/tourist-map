var searchPlace = require('./comp/search-place')
var choosePlace = require('./comp/choose-place')
var mapMenu = require('./comp/map-menu')
var mapInit = require('./map/init')
var getOverpass = require('./api/get-overpass')

module.exports = function(config) {
	var e = config.evt

	e.on('page-load', function() {
		searchPlace(e)
	})
	e.on('page-resize', function() {
		console.log('Page was resized')
		if(config.state === 'map') { config.setMapHeight() }
	})
	e.on('place-search-err', function(err) {
		console.log('place-search-err', err)
	})
	e.on('place-search-success', function(data) { 
		choosePlace(e, data)
	})
	e.on('place-coords', function(pt) {
		config.pt = pt
		getOverpass(pt, 'tourism', function(err, data) {
			if(err) { e.emit('tourism-data-err', err) }
			else { e.emit('tourism-data', data) }
		})
		config.collapseMenu()
		config.setState('map')
		mapInit('map', pt, config)
		mapMenu('main', config)
	})
	e.on('overpass-data-err', function(err) {
		console.log('overpass-data-err', err)
	})
	e.on('map-show-tourism', function() {
		if(config.mapData.data['tourism']) {
			e.emit('show-tourism-data')
		} else {
			getOverpass(config.pt, 'tourism', function(err, data) {
				if(err) { e.emit('overpass-data-err', err) }
				else { e.emit('tourism-data', data) }
			})
		}
		config.mapMenu.current = 'tourism'
		mapMenu('main', config)
	})
	e.on('map-show-drink', function() {
		if(config.mapData.data['drink']) {
			e.emit('show-drink-data')
		} else {
			getOverpass(config.pt, 'drink', function(err, data) {
				if(err) { e.emit('overpass-data-err', err) }
				else { e.emit('drink-data', data) }
			})
		}
		config.mapMenu.current = 'drink'
		mapMenu('main', config)
	})
	e.on('map-show-eat', function() {
		if(config.mapData.data['eat']) {
			e.emit('show-eat-data')
		} else {
			getOverpass(config.pt, 'eat', function(err, data) {
				if(err) { e.emit('overpass-data-err', err) }
				else { e.emit('eat-data', data) }
			})
		}
		config.mapMenu.current = 'eat'
		mapMenu('main', config)
	})
	e.on('map-menu-more', function() {
		config.mapMenu.prev = config.mapMenu.current
		config.mapMenu.current = 'more'
		mapMenu('more-menu', config)
	})
	e.on('map-menu-more-close', function() {
		config.mapMenu.current = config.mapMenu.prev
		config.mapMenu.prev = undefined
		mapMenu('main', config)
	})
	e.on('show-legend', function() {
		console.log('evt show-legend')
		mapMenu('legend', config)
	})
}


