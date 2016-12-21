var icon = require('./icons')
var dom = require('../../dom')
var tmpl = require('./tmpl-main')

module.exports = function(config) {
	tmpl.view(config, null, function() {
		tmpl.ctrl(config, null)
	})
}

