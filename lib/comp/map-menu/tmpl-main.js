function ctrl(config) {
	var e = config.evt
	dom.byId('map-menu-main-tourism').onclick = function() { e.emit('map-show-tourism') }
	dom.byId('map-menu-main-drink').onclick = function() { e.emit('map-show-drink') }
	dom.byId('map-menu-main-eat').onclick = function() { e.emit('map-show-eat') }
	dom.byId('map-menu-main-more').onclick = function() { e.emit('map-menu-more') }
}

function view(config, callback) {
	config.menu.className = 'map-menu-main-row'
	var html = '<div id="map-menu-main-tourism" class="map-menu-main-cell' + visible('tourism', config) + '">' + icon.tourism + '</div>'
	+ '<div id="map-menu-main-drink" class="map-menu-main-cell' + visible('drink', config) + '">' + icon.drink + '</div>'
	+ '<div id="map-menu-main-eat" class="map-menu-main-cell' + visible('eat', config) + '">' + icon.eat + '</div>'
	+ '<div id="map-menu-main-more" class="map-menu-main-cell' + visible('more', config) + '">' + icon.menu + '</div>'
	config.menu.innerHTML = html
	config.setMapHeight()
	callback()
}

function visible(n, config) {
	if(config.mapMenu.current === n) { return ' visible' }
	else { return '' }
}
