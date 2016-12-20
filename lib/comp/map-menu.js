var main = require('./map-menu/main')
var more = require('./map-menu/more')
var legend = require('./map-menu/legend')

module.exports = function(state, config) {
	config.collapseMenu()
	if(state === 'main') { main(config) }
	else if(state === 'more-menu') { more(config) }
	else if(state === 'legend') { legend(config) }	
}
