var place = require('../api/get-place')

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
	var html = '<input id="place"/><button id="place-btn">GO</button>'
	document.getElementById('menu').innerHTML = html
	callback()
}
