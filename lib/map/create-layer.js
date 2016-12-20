var createPopup = require('./create-popup')

module.exports = function(mapData, layerName) {
	var layer = L.layerGroup().addTo(mapData.map)
	mapData.layers[layerName] = layer
	mapData.data[layerName].forEach(function(f) {
		var icon = mapData.icons[f.properties.type]
		if(icon) { 
			var marker = L.marker([f.geometry.coordinates[1], f.geometry.coordinates[0]], {icon: icon})
			var pu = createPopup(f.properties)
			marker.bindPopup(pu)
			layer.addLayer(marker)
		}
	})
}
