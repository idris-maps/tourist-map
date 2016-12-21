var icon = require('./icons')
var dom = require('../../dom')
var tmpl = require('./tmpl-main')

module.exports = function(config) {
	tmpl.view(config, extra(config), function() {
		tmpl.ctrl(config, extra(config))
	})
}

function extra(config) {
	return { 
		html: '<div class="map-menu-legend">' + legendView() + '</div>',
		ctrl: function() {
			dom.byId('map-menu-main-close').onclick = function() { config.evt.emit('map-menu-more-close') }
		}
	}
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

