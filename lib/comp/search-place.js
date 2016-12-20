var place = require('../api/get-place')
var icon = require('./tourist-icon')
module.exports = function(evt) {
	view(function() {
		ctrl(evt)
	})
}

function ctrl(evt) {
	document.getElementById('place-btn').onclick = function() {
		place(document.getElementById('place').value, function(err, data) { 
			if(err) { evt.emit('place-search-err', err) }
			else { evt.emit('place-search-success', data) }
		})
	}
}

function view(callback) {
	var html = '<div id="menu-init">'
		+ icon
		+ '<input id="place"/ placeholder="Choose a city"><button id="place-btn">OK</button>'
	+ '</div>'
	document.getElementById('menu').innerHTML = html
	callback()
}
