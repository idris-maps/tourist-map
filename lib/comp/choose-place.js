module.exports = function(evt, places) {
	view(places, function(choices) {
		ctrl(evt, choices)
	})
}

function ctrl(evt, choices) {
	var els = document.getElementsByClassName('places')
	for(i=0;i<els.length;i++) {
		els[i].addEventListener('click', function(e) {
			evt.emit('place-coords', choices[e.target.id])
		})
	}
}

function view(places, callback) {
	var html = '<div id="menu-init"><h2>Choose city</h2>'
	var choices = {}
	places.forEach(function(p, i) {
		var id = 'place-' + i
		html = html + '<p id="' + id + '" class="places">' + p.name + '</p>'
		choices[id] = p.coords
	})
	document.getElementById('menu').innerHTML = html + '</div>'
	callback(choices)
}
