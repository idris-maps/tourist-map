var place = require('../api/get-place')
var icon = require('./tourist-icon')
module.exports = function(evt, searchError) {
	view(searchError, function() {
		ctrl(evt)
	})
}

function ctrl(evt) {
	document.getElementById('place-btn').onclick = function() {
		place(document.getElementById('place').value, function(err, data) { 
			if(err) { evt.emit('place-search-err', err) }
			else { 
				if(data.length === 0) { evt.emit('place-search-none') }
				else { 
					var five = []
					if(data.length > 5) { for(i=0;i<6;i++) { five.push(data[i]) } }
					else { five = data }
					evt.emit('place-search-success', five) 
				}
			}
		})
	}
}

function view(searchError, callback) {
	var html = '<div id="menu-init">'
		+ icon
		+ '<input id="place"/ placeholder="Search a city"><button id="place-btn">OK</button>'
	if(searchError) { html = html + '<p id="info">' + searchError + '</p>' }	
	html = html + '</div>'
	document.getElementById('menu').innerHTML = html
	callback()
}
