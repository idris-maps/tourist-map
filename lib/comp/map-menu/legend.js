var icon = require('./icons')
var dom = require('../../dom')

module.exports = function(config) {
	view(config, function() {
		ctrl(config)
	})
}

function ctrl(config) {
	var e = config.evt
	dom.byId('map-menu-main-tourism').onclick = function() { e.emit('map-show-tourism') }
	dom.byId('map-menu-main-drink').onclick = function() { e.emit('map-show-drink') }
	dom.byId('map-menu-main-eat').onclick = function() { e.emit('map-show-eat') }
	dom.byId('map-menu-main-close').onclick = function() { e.emit('map-menu-more-close') }
}

function view(config, callback) {
	config.menu.className = ''
	var html = '<div class="map-menu-legend">'
		+ legendView()
	+ '</div>'
	+ '<div class="map-menu-main-row">'
		+ '<div id="map-menu-main-tourism" class="map-menu-main-cell' + visible('tourism', config) + '">' + icon.tourism + '</div>'
		+ '<div id="map-menu-main-drink" class="map-menu-main-cell' + visible('drink', config) + '">' + icon.drink + '</div>'
		+ '<div id="map-menu-main-eat" class="map-menu-main-cell' + visible('eat', config) + '">' + icon.eat + '</div>'
		+ '<div id="map-menu-main-close" class="map-menu-main-cell' + visible('more', config) + '">' + icon.close + '</div>'
	+ '</div>'
	config.menu.innerHTML = html
	config.setMapHeight()
	callback()
}

function visible(n, config) {
	if(config.mapMenu.current === n) { return ' visible' }
	else { return '' }
}

function legendView() {
	var markers = [
		'aquarium', 'artwork', 'attraction', 'gallery', 'information', 'museum', 'theme_park', 'viewpoint', 'zoo', 'bar', 'cafe', 'restaurant'
	]
	var html = ''
	markers.forEach(function(m) {
		html = html + '<div class="map-menu-legend-item">'
			+ '<div class="map-menu-leg-img"><img src="marker/' + m + '.png" alt="' + m + '"></div>'
			+ '<div class="map-menu-leg-txt"><span>' + fix(m) + '</span></div>'
		+ '</div>'
	})
	return html
}

function fix(m) {
	var s = m.split('_')
	if(s.length === 1) { return m }
	else { return s[0] + ' ' + s[1] } 
}
