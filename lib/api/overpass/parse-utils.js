function getPolys(data) {
	data.relations.forEach(function(r) {
		var coords = []
		r.members.forEach(function(m) {
			if(m.role === 'outer') { 
				var cs = getWay(m.ref, data.ways) 
				cs.forEach(function(pt) { coords.push(pt) })
			}
		})
		if(r.tags) {
			data.feats.push({type: 'Feature', properties: r.tags, geometry: {type: 'Point', coordinates: getCenter(coords)}})
		}
	})
	return data
}




function getWay(ref, ways) {
	var r = null
	for(i=0;i<ways.length;i++) {
		if(ways[i].id === ref) { r = ways[i].coords }
	}
	return r
}

function getLines(data) {
	data.ways.forEach(function(w) {
		var coords = []
		w.nodes.forEach(function(n) {
			coords.push(getNode(n, data.nodes))
		})
		w.coords = coords
		if(w.tags) {
			data.feats.push({type: 'Feature', properties: w.tags,  geometry: { type: 'Point', coordinates: getCenter(w.coords) }})
		}
	})
	return data
}

function getNode(id, nodes) {
	var r = null
	for(i=0;i<nodes.length;i++) {
		if(nodes[i].id === id) { r = [nodes[i].lon, nodes[i].lat]; break }
	}
	return r
}

function getCenter(coords) {
	var xMin = Infinity
	var xMax = -Infinity
	var yMin = Infinity
	var yMax = -Infinity
	coords.forEach(function(p) {
		if(p[0] > xMax) { xMax = p[0] }
		else if(p[0] < xMin) { xMin = p[0] }
		if(p[1] > yMax) { yMax = p[1] }
		else if(p[1] < yMin) { yMin = p[1] }
	})
	return [xMin + (xMax-xMin)/2, yMin + (yMax-yMin)/2]
}



function getPoints(data) {
	var nodes = []
	var ways = []
	var relations = []
	var pointFeats = []
	data.elements.forEach(function(d) { 
		if(d.type === 'node') {
			nodes.push(d)
			if(d.tags) {
				pointFeats.push({type:'Feature', properties: d.tags, geometry: {type: 'Point', coordinates: [d.lon, d.lat]}})
			}
		} else if(d.type === 'way') {
			ways.push(d)
		} else if(d.type === 'relation') {
			relations.push(d)
		}
	})
	return {
		nodes: nodes, ways: ways, relations: relations, feats: pointFeats
	}
}

function uniq(feats) {
	var names = {}
	var uniq = []
	feats.forEach(function(f) {
		if(f.properties.name && f.geometry.coordinates) {
			var n = f.properties.name
			if(!names[n]) { names[n] = true; uniq.push(f) }
		}
	})
	return uniq
}

function featuresTourism(uniq) {
	var feats = []
	uniq.forEach(function(f) {
		var o = { name: f.properties.name }

		var adr = {}
		if(f.properties['addr:street']) { adr.street = f.properties['addr:street'] }
		if(f.properties['addr:housenumber']) { adr.nb = f.properties['addr:housenumber']  }
		if(adr.nb && adr.street) { o.adr = adr.street + ', ' + adr.nb }
		else if(adr.street) { o.adr = adr.street }

		if(f.properties.website) { o.web = f.properties.website }
	
		if(f.properties.wikipedia) { 
			var sWiki = f.properties.wikipedia.split(':')
			var sWikiName = sWiki[1].split(' ')
			var n = ''
			sWikiName.forEach(function(p, i) {
				n = n + p
				if(i !== sWikiName.length-1) { n = n + '_' }
			})
			o.wiki = 'https://' + sWiki[0] + '.wikipedia.org/wiki/' + n
		}
		if(f.properties.tourism) { 
			o.type = f.properties.tourism
		}
		if(f.properties.historic) { 
			if(f.properties.historic !== 'yes') {
				o.hist = 'Historic'
				var sHist = f.properties.historic.split('_')
				sHist.forEach(function(p) { o.hist = o.hist + ' ' + p })
			}
		}
		if(f.properties.phone) { o.phone = f.properties .phone }
		if(f.properties.opening_hours) {
			o.hours = []
			var sOh = f.properties.opening_hours.split(';')
			sOh.forEach(function(p) { o.hours.push(p.trim()) })
		}
		f.properties = o
		feats.push(f)
	})
	return feats
}

function featuresDrink(uniq) {
	var feats = []
	uniq.forEach(function(f) {
		var o = { name: f.properties.name }

		var adr = {}
		if(f.properties['addr:street']) { adr.street = f.properties['addr:street'] }
		if(f.properties['addr:housenumber']) { adr.nb = f.properties['addr:housenumber']  }
		if(adr.nb && adr.street) { o.adr = adr.street + ', ' + adr.nb }
		else if(adr.street) { o.adr = adr.street }

		if(f.properties.website) { o.web = f.properties.website }

		if(f.properties.amenity === 'cafe') {
			o.type = 'cafe'
		}	else {
			o.type = 'bar'
		}

		if(f.properties.wikipedia) { 
			var sWiki = f.properties.wikipedia.split(':')
			var sWikiName = sWiki[1].split(' ')
			var n = ''
			sWikiName.forEach(function(p, i) {
				n = n + p
				if(i !== sWikiName.length-1) { n = n + '_' }
			})
			o.wiki = 'https://' + sWiki[0] + '.wikipedia.org/wiki/' + n
		}
		if(f.properties.phone) { o.phone = f.properties .phone }
		if(f.properties.opening_hours) {
			o.hours = []
			var sOh = f.properties.opening_hours.split(';')
			sOh.forEach(function(p) { o.hours.push(p.trim()) })
		}
		f.properties = o
		feats.push(f)
	})
	return feats
}

function featuresEat(uniq) {
	var feats = []
	uniq.forEach(function(f) {
		var o = { name: f.properties.name }

		var adr = {}
		if(f.properties['addr:street']) { adr.street = f.properties['addr:street'] }
		if(f.properties['addr:housenumber']) { adr.nb = f.properties['addr:housenumber']  }
		if(adr.nb && adr.street) { o.adr = adr.street + ', ' + adr.nb }
		else if(adr.street) { o.adr = adr.street }

		o.type = 'restaurant'

		if(f.properties.website) { o.web = f.properties.website }
		if(f.properties.cuisine) {
			o.cuisine = ''
			var sC = f.properties.cuisine.split('_')
			sC.forEach(function(p,i) { 
				o.cuisine = o.cuisine + p  
				if(i !== sC.length-1) { o.cuisine = o.cuisine + ' ' }
			})
		}
		if(f.properties.wikipedia) { 
			var sWiki = f.properties.wikipedia.split(':')
			var sWikiName = sWiki[1].split(' ')
			var n = ''
			sWikiName.forEach(function(p, i) {
				n = n + p
				if(i !== sWikiName.length-1) { n = n + '_' }
			})
			o.wiki = 'https://' + sWiki[0] + '.wikipedia.org/wiki/' + n
		}
		if(f.properties.phone) { o.phone = f.properties .phone }
		if(f.properties.opening_hours) {
			o.hours = []
			var sOh = f.properties.opening_hours.split(';')
			sOh.forEach(function(p) { o.hours.push(p.trim()) })
		}
		f.properties = o
		feats.push(f)
	})
	return feats
}

exports.points = getPoints
exports.lines = getLines
exports.polys = getPolys
exports.uniq = uniq
exports.featuresTourism = featuresTourism
exports.featuresDrink = featuresDrink
exports.featuresEat = featuresEat
