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
	dom.byId('map-menu-more-change-city').onclick = function() { window.location.reload() }
	dom.byId('map-menu-more-legend').onclick = function() { e.emit('show-legend') }
}

function view(config, callback) {
	config.menu.className = ''
	var html = '<div class="map-menu-more">'
		+ '<div id="map-menu-more-change-city" class="map-menu-more-item"><span>Change city</span></div>'
		+ '<div id="map-menu-more-legend" class="map-menu-more-item"><span>Map legend</span></div>'
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
