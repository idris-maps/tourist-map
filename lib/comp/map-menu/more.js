var icon = require('./icons')
var dom = require('../../dom')
var tmpl = require('./tmpl-main')

module.exports = function(config) {
	tmpl.view(config, extra(config), function() {
		tmpl.ctrl(config, extra(config))
	})
}

function extra(config) {
	var html = '<div class="map-menu-more">'
			+ '<div id="map-menu-more-change-city" class="map-menu-more-item"><span>Change city</span></div>'
			+ '<div id="map-menu-more-legend" class="map-menu-more-item"><span>Map symbols</span></div>'
		+ '</div>'
	return {
		html: html,
		ctrl: function() {
			var e = config.evt
			dom.byId('map-menu-main-close').onclick = function() { e.emit('map-menu-more-close') }
			dom.byId('map-menu-more-change-city').onclick = function() { window.location.reload() }
			dom.byId('map-menu-more-legend').onclick = function() { e.emit('show-legend') }
		}
	}
}

