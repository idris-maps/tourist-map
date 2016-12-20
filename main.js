var Emitter = require('events').EventEmitter
var events = require('./lib/events')
var Config = require('./lib/config')

window.onload = function() {
	var evt = new Emitter()
	var config = new Config(evt)
	window.config = config
	events(config)
	evt.emit('page-load')
	window.onresize = function() {
		evt.emit('page-resize')
	}
}


