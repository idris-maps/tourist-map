var dom = require('./dom')

module.exports = function(evt) {
	var o = this
	o.menu = dom.byId('menu')
	o.map = dom.byId('map')
	o.state = 'init-menu' // alt: ['map']
	o.setState = function(s) { o.state = s }
	o.evt = evt
	o.mapMenu = { current: 'tourism' }
	o.setMapHeight = function() {
		var mapH = window.innerHeight - o.menu.offsetHeight
		o.map.style.height = mapH + 'px'
	}
	o.collapseMenu = function() {
		dom.clear(o.menu)
		o.setMapHeight()
	}
}


