var icon = require('./icons')
var dom = require('../../dom')

function ctrl(config, extra) {
	var e = config.evt
	dom.byId('map-menu-main-tourism').onclick = function() { e.emit('map-show-tourism') }
	dom.byId('map-menu-main-drink').onclick = function() { e.emit('map-show-drink') }
	dom.byId('map-menu-main-eat').onclick = function() { e.emit('map-show-eat') }
	if(extra) {
		if(extra.ctrl) { extra.ctrl() }
	} else {
		dom.byId('map-menu-main-more').onclick = function() { e.emit('map-menu-more') }
	}
}

function view(config, extra, callback) {
	var html = ''
	if(extra) { 
		if(extra.html) { html = extra.html } 
		var btn = '<div id="map-menu-main-close" class="map-menu-main-cell' 
			+ visible('more', config) + '">' + icon.close + '</div>'
	} else {
		var btn = '<div id="map-menu-main-more" class="map-menu-main-cell' 
			+ visible('more', config) + '">' + icon.menu + '</div>'
	}
	html = html + '<div class="map-menu-main-row">'
		+ '<div id="map-menu-main-tourism" class="map-menu-main-cell' 
			+ visible('tourism', config) + '">' + icon.tourism + '</div>'
		+ '<div id="map-menu-main-drink" class="map-menu-main-cell' 
			+ visible('drink', config) + '">' + icon.drink + '</div>'
		+ '<div id="map-menu-main-eat" class="map-menu-main-cell' 
			+ visible('eat', config) + '">' + icon.eat + '</div>'
		+ btn
	+ '<div>'
	config.menu.innerHTML = html
	config.setMapHeight()
	callback()
}

function visible(n, config) {
	if(config.mapMenu.current === n) { return ' visible' }
	else { return '' }
}

exports.ctrl = ctrl
exports.view = view
