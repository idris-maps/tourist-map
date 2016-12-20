var types = ['aquarium',
'artwork',
'attraction',
'gallery',
'information',
'museum',
'theme_park',
'viewpoint',
'zoo',
'bar',
'cafe',
'restaurant'
]

module.exports = function() {
	return icons(types)
}

function icons(types) {
	var i = {}
	types.forEach(function(t) { i[t] = createIcon(t) })
	return i
}

function createIcon(n) {
	var icon = L.icon({
    iconUrl: 'marker/' + n + '.png',
    iconSize:     [30, 38], // size of the icon
    iconAnchor:   [15, 38], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
	})
	return icon
}
