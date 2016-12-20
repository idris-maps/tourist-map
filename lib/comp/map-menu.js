var main = require('./map-menu/main')

module.exports = function(state, config) {
	config.collapseMenu()
	if(state === 'main') { main(config) }
}
