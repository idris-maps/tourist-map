module.exports = function(data) {
	var r = []
	data.forEach(function(d) {
		var o = {
			name: d.display_name,
			coords: [+d.lon, +d.lat]
		}
		r.push(o)
	})
	return r
}
