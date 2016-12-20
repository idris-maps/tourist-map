(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var config = require('./overpass/config')
var km = config.radius
var timeout = config.timeout
var createBbox = require('./utils/bbox-km')
var createUrl = require('./overpass/create-url')
var get = require('./utils/get-json')
var pars = require('./overpass/parse')

module.exports = function(pt, type, callback) {
	if(type==='tourism') {
		var url = createUrl(createBbox(pt, km), config.tourism(), timeout)
		get(url, function(err, data) {
			if(err) { callback(err) }
			else { callback(null, pars.tourism(data)) }
		})
	} else if(type==='drink') {
		var url = createUrl(createBbox(pt, km), config.drink(), timeout)
		get(url, function(err, data) {
			if(err) { callback(err) }
			else { callback(null, pars.drink(data)) }
		})
	} else if(type==='eat') {
		var url = createUrl(createBbox(pt, km), config.eat(), timeout)
		get(url, function(err, data) {
			if(err) { callback(err) }
			else { callback(null, pars.eat(data)) }
		})
	} else {
		callback(type + ' is not a valid type')
	}
}


},{"./overpass/config":3,"./overpass/create-url":4,"./overpass/parse":6,"./utils/bbox-km":8,"./utils/get-json":9}],2:[function(require,module,exports){
var read = require('./place/parse')
var get = require('./utils/get-json')

module.exports = function(place, callback) {
	var url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + place
	get(url, function(err, data) {
		if(err) { callback(err) }
		else {
			callback(null, read(data))
		}
	})
}

},{"./place/parse":7,"./utils/get-json":9}],3:[function(require,module,exports){
function tourism() {
	var t = ['aquarium','artwork','attraction','gallery','information','museum','theme_park','viewpoint','zoo']
	var keyVals = []
	t.forEach(function(val) {
		keyVals.push({types: ['node', 'way', 'relation'], key: 'tourism', val: val})
	})
	return keyVals
}

function drink() {
	var a = ['bar', 'pub', 'cafe']
	var keyVals = []
	a.forEach(function(val) {
		keyVals.push({types: ['node', 'way', 'relation'], key: 'amenity', val: val})
	})
	return keyVals
}

function eat() {
	return [
		{types: ['node', 'way', 'relation'], key: 'amenity', val: 'restaurant'}
	]
}

exports.tourism = tourism
exports.drink = drink
exports.eat = eat
exports.radius = 1.5
exports.timeout = 30


},{}],4:[function(require,module,exports){
module.exports = function(bb, keyVals, timeout) {
	return url(bbox(bb), keyVals, timeout)
}

function bbox(bb) {
	return '%28' + bb[1] + '%2C' + bb[0] + '%2C' + bb[3] + '%2C' + bb[2] + '%29'
}


/*
keyVals
[{
	key: 
	val:
	types:['node', 'way', 'relation']
}]
*/

function url(bbox, keyVals, timeout) {
	var url = 'http://www.overpass-api.de/api/interpreter?data=[out:json]'
	var time = 25
	if(timeout) { time = timeout }
	url = url + '[timeout:' + time + '];('
	
	keyVals.forEach(function(kv) {
		var k = kv.key
		var v = kv.val
		kv.types.forEach(function(kvt) {
			url = url + kvt + '["' + k + '"="' + v + '"]' + bbox + ';'
		})
	})

	url = url + ');out body;>;out skel qt;'
	return decodeURIComponent(url)
} 
/*
"http://www.overpass-api.de/api/interpreter?data=[out:json][timeout:25];(node["tourism"="aquarium"](47.5401077,7.5598261,47.5761077,7.6158261);way["tourism"="aquarium"](47.5401077,7.5598261,47.5761077,7.6158261);relation["tourism"="aquarium"](47.5401077,7.5598261,47.5761077,7.6158261);node["tourism"="artwork"](47.5401077,7.5598261,47.5761077,7.6158261);way["tourism"="artwork"](47.5401077,7.5598261,47.5761077,7.6158261);relation["tourism"="artwork"](47.5401077,7.5598261,47.5761077,7.6158261);node["tourism"="attraction"](47.5401077,7.5598261,47.5761077,7.6158261);way["tourism"="attraction"](47.5401077,7.5598261,47.5761077,7.6158261);relation["tourism"="attraction"](47.5401077,7.5598261,47.5761077,7.6158261);node["tourism"="gallery"](47.5401077,7.5598261,47.5761077,7.6158261);way["tourism"="gallery"](47.5401077,7.5598261,47.5761077,7.6158261);relation["tourism"="gallery"](47.5401077,7.5598261,47.5761077,7.6158261);node["tourism"="information"](47.5401077,7.5598261,47.5761077,7.6158261);way["tourism"="information"](47.5401077,7.5598261,47.5761077,7.6158261);relation["tourism"="information"](47.5401077,7.5598261,47.5761077,7.6158261);node["tourism"="museum"](47.5401077,7.5598261,47.5761077,7.6158261);way["tourism"="museum"](47.5401077,7.5598261,47.5761077,7.6158261);relation["tourism"="museum"](47.5401077,7.5598261,47.5761077,7.6158261);node["tourism"="theme_park"](47.5401077,7.5598261,47.5761077,7.6158261);way["tourism"="theme_park"](47.5401077,7.5598261,47.5761077,7.6158261);relation["tourism"="theme_park"](47.5401077,7.5598261,47.5761077,7.6158261);node["tourism"="viewpoint"](47.5401077,7.5598261,47.5761077,7.6158261);way["tourism"="viewpoint"](47.5401077,7.5598261,47.5761077,7.6158261);relation["tourism"="viewpoint"](47.5401077,7.5598261,47.5761077,7.6158261);node["tourism"="wilderness_hut"](47.5401077,7.5598261,47.5761077,7.6158261);way["tourism"="wilderness_hut"](47.5401077,7.5598261,47.5761077,7.6158261);relation["tourism"="wilderness_hut"](47.5401077,7.5598261,47.5761077,7.6158261);node["tourism"="zoo"](47.5401077,7.5598261,47.5761077,7.6158261);way["tourism"="zoo"](47.5401077,7.5598261,47.5761077,7.6158261);relation["tourism"="zoo"](47.5401077,7.5598261,47.5761077,7.6158261););out body;>;out skel qt;
*/


},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
var get = require('./parse-utils')

exports.tourism = function(data) {
	var points = get.points(data)
	var lines = get.lines(points)
	var polys = get.polys(lines)
	var pointFeats = get.uniq(polys.feats)
	return get.featuresTourism(pointFeats)
}

exports.drink = function(data) {
	var points = get.points(data)
	var lines = get.lines(points)
	var polys = get.polys(lines)
	var pointFeats = get.uniq(polys.feats)
	return get.featuresDrink(pointFeats)
}

exports.eat = function(data) {
	var points = get.points(data)
	var lines = get.lines(points)
	var polys = get.polys(lines)
	var pointFeats = get.uniq(polys.feats)
	return get.featuresEat(pointFeats)
}

},{"./parse-utils":5}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
module.exports = function(pt, km) {
	var xMin = pt[0] - getLngDist(pt[1])*km
	var xMax = pt[0] + getLngDist(pt[1])*km
	var yMin = pt[1] - 0.009*km
	var yMax = pt[1] + 0.009*km
	return [xMin, yMin, xMax, yMax]
}



function getLngDist(lat) {
	if(lat < -80) { return 0.05200000000000004}
	else if(lat < -70) { return 0.027000000000000017}
	else if(lat < -60) { return 0.01800000000000001}
	else if(lat < -50) { return 0.014000000000000005}
	else if(lat < -40) { return 0.012000000000000004}
	else if(lat < -30) { return 0.011000000000000003}
	else if(lat < -20) { return 0.010000000000000002}
	else if(lat < -10) { return 0.010000000000000002}
	else if(lat < 0) { return 0.009000000000000001}
	else if(lat < 10) { return 0.010000000000000002}
	else if(lat < 20) { return 0.010000000000000002}
	else if(lat < 30) { return 0.011000000000000003}
	else if(lat < 40) { return 0.012000000000000004}
	else if(lat < 50) { return 0.014000000000000005}
	else if(lat < 60) { return 0.01800000000000001}
	else if(lat < 70) { return 0.027000000000000017}
	else if(lat < 80) { return 0.05200000000000004}
}
/*
function tryN(n) {
	loop(n, n, 0, 0, 0, function(s,e,d) { console.log('if(lat === ' + n.toString() + ') { return ' + (e[0]-s[0]).toString() + '}') } )
}


function loop(startLat, endLat, startLng, endLng, dist, callback) {
	if(dist > 1) { callback([startLng, startLat], [endLng, endLat], dist) }
	else {
		var d = h([startLng, startLat], [endLng + 0.001, endLat])
		loop(startLat, endLat, startLng, endLng+ 0.001, d, callback)
	}
}
*/

},{}],9:[function(require,module,exports){
module.exports = function(url, callback) {
	var request = new XMLHttpRequest()
	request.open('GET', url, true)
	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
		  var data = JSON.parse(request.responseText)
			callback(null, data)
		} else {
			callback('Server at "' + url + '" returned an error')
		}
	}
	request.onerror = function() {
		callback('Server at "' + url + '" did not answer')
	}
	request.send()
}



},{}],10:[function(require,module,exports){
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
	var html = '<div id="menu-init">'
	var choices = {}
	places.forEach(function(p, i) {
		var id = 'place-' + i
		html = html + '<p id="' + id + '" class="places">' + p.name + '</p>'
		choices[id] = p.coords
	})
	document.getElementById('menu').innerHTML = html + '</div>'
	callback(choices)
}

},{}],11:[function(require,module,exports){
var main = require('./map-menu/main')
var more = require('./map-menu/more')
var legend = require('./map-menu/legend')

module.exports = function(state, config) {
	config.collapseMenu()
	if(state === 'main') { main(config) }
	else if(state === 'more-menu') { more(config) }
	else if(state === 'legend') { legend(config) }	
}

},{"./map-menu/legend":13,"./map-menu/main":14,"./map-menu/more":15}],12:[function(require,module,exports){
exports.drink = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 19" width="30"><title>Drink</title><rect fill="none" x="0" y="0" width="19" height="19"></rect><path fill="#000" transform="translate(2 2)" d="M12,5V2c0,0-1-1-4.5-1S3,2,3,2v3c0.0288,1.3915,0.3706,2.7586,1,4c0.6255,1.4348,0.6255,3.0652,0,4.5c0,0,0,1,3.5,1 s3.5-1,3.5-1c-0.6255-1.4348-0.6255-3.0652,0-4.5C11.6294,7.7586,11.9712,6.3915,12,5z M7.5,13.5 c-0.7966,0.035-1.5937-0.0596-2.36-0.28c0.203-0.7224,0.304-1.4696,0.3-2.22h4.12c-0.004,0.7504,0.097,1.4976,0.3,2.22 C9.0937,13.4404,8.2966,13.535,7.5,13.5z M7.5,5C6.3136,5.0299,5.1306,4.8609,4,4.5v-2C5.131,2.1411,6.3137,1.9722,7.5,2 C8.6863,1.9722,9.869,2.1411,11,2.5v2C9.8694,4.8609,8.6864,5.0299,7.5,5z"></path></svg>'

exports.eat = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 19" width="30"><title>Eat</title><rect fill="none" x="0" y="0" width="19" height="19"></rect><path fill="#000" transform="translate(2 2)" d="M3.5,0l-1,5.5c-0.1464,0.805,1.7815,1.181,1.75,2L4,14c-0.0384,0.9993,1,1,1,1s1.0384-0.0007,1-1L5.75,7.5 c-0.0314-0.8176,1.7334-1.1808,1.75-2L6.5,0H6l0.25,4L5.5,4.5L5.25,0h-0.5L4.5,4.5L3.75,4L4,0H3.5z M12,0 c-0.7364,0-1.9642,0.6549-2.4551,1.6367C9.1358,2.3731,9,4.0182,9,5v2.5c0,0.8182,1.0909,1,1.5,1L10,14c-0.0905,0.9959,1,1,1,1 s1,0,1-1V0z"></path></svg>'

exports.tourism = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 19" width="30"><title>Tourism</title><rect fill="none" x="0" y="0" width="19" height="19"></rect><path fill="#000" transform="translate(2 2)" d="M6,2C5.446,2,5.2478,2.5045,5,3L4.5,4h-2C1.669,4,1,4.669,1,5.5v5C1,11.331,1.669,12,2.5,12h10 c0.831,0,1.5-0.669,1.5-1.5v-5C14,4.669,13.331,4,12.5,4h-2L10,3C9.75,2.5,9.554,2,9,2H6z M2.5,5C2.7761,5,3,5.2239,3,5.5 S2.7761,6,2.5,6S2,5.7761,2,5.5S2.2239,5,2.5,5z M7.5,5c1.6569,0,3,1.3431,3,3s-1.3431,3-3,3s-3-1.3431-3-3S5.8431,5,7.5,5z M7.5,6.5C6.6716,6.5,6,7.1716,6,8l0,0c0,0.8284,0.6716,1.5,1.5,1.5l0,0C8.3284,9.5,9,8.8284,9,8l0,0C9,7.1716,8.3284,6.5,7.5,6.5 L7.5,6.5z"></path></svg>'

exports.menu = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 19" height="19" width="19"><title>Menu</title><path fill="#000" transform="translate(0 -3)" d="M 2 3 C 1.446 3 1 3.446 1 4 L 1 5 C 1 5.554 1.446 6 2 6 L 17 6 C 17.554 6 18 5.554 18 5 L 18 4 C 18 3.446 17.554 3 17 3 L 2 3 z M 2 8 C 1.446 8 1 8.446 1 9 L 1 10 C 1 10.554 1.446 11 2 11 L 17 11 C 17.554 11 18 10.554 18 10 L 18 9 C 18 8.446 17.554 8 17 8 L 2 8 z M 2 13 C 1.446 13 1 13.446 1 14 L 1 15 C 1 15.554 1.446 16 2 16 L 17 16 C 17.554 16 18 15.554 18 15 L 18 14 C 18 13.446 17.554 13 17 13 L 2 13 z"></path></svg>'

exports.close = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 19" height="19" width="19"><title>Close</title><path fill="#000" transform="translate(0 -3)" d="M 4.625 3.125 C 4.3693886 3.1230136 4.1036348 3.2119095 3.90625 3.40625 L 3.21875 4.09375 C 2.8239805 4.4824311 2.7988189 5.1364804 3.1875 5.53125 L 7.40625 9.8125 L 3.1875 14.125 C 2.7988189 14.51977 2.8239804 15.142569 3.21875 15.53125 L 3.90625 16.21875 C 4.3010196 16.607431 4.9550689 16.61352 5.34375 16.21875 L 9.53125 11.96875 L 13.71875 16.21875 C 14.107431 16.61352 14.73023 16.607431 15.125 16.21875 L 15.84375 15.53125 C 16.23852 15.142569 16.232431 14.48852 15.84375 14.09375 L 11.625 9.8125 L 15.84375 5.53125 C 16.232431 5.1364804 16.23852 4.5136811 15.84375 4.125 L 15.125 3.40625 C 14.73023 3.0175689 14.107431 3.0427304 13.71875 3.4375 L 9.53125 7.6875 L 5.34375 3.40625 C 5.1494095 3.2088652 4.8806114 3.1269864 4.625 3.125 z"></path></svg>'

},{}],13:[function(require,module,exports){
var icon = require('./icons')
var dom = require('../../dom')

module.exports = function(config) {
	view(config, function() {
		ctrl(config)
	})
}

function ctrl(config) {
	var e = config.evt
	dom.byId('map-menu-main-tourism').onclick = function() { e.emit('map-show-tourism') }
	dom.byId('map-menu-main-drink').onclick = function() { e.emit('map-show-drink') }
	dom.byId('map-menu-main-eat').onclick = function() { e.emit('map-show-eat') }
	dom.byId('map-menu-main-close').onclick = function() { e.emit('map-menu-more-close') }
}

function view(config, callback) {
	config.menu.className = ''
	var html = '<div class="map-menu-legend">'
		+ legendView()
	+ '</div>'
	+ '<div class="map-menu-main-row">'
		+ '<div id="map-menu-main-tourism" class="map-menu-main-cell' + visible('tourism', config) + '">' + icon.tourism + '</div>'
		+ '<div id="map-menu-main-drink" class="map-menu-main-cell' + visible('drink', config) + '">' + icon.drink + '</div>'
		+ '<div id="map-menu-main-eat" class="map-menu-main-cell' + visible('eat', config) + '">' + icon.eat + '</div>'
		+ '<div id="map-menu-main-close" class="map-menu-main-cell' + visible('more', config) + '">' + icon.close + '</div>'
	+ '</div>'
	config.menu.innerHTML = html
	config.setMapHeight()
	callback()
}

function visible(n, config) {
	if(config.mapMenu.current === n) { return ' visible' }
	else { return '' }
}

function legendView() {
	var markers = [
		'aquarium', 'artwork', 'attraction', 'gallery', 'information', 'museum', 'theme_park', 'viewpoint', 'zoo', 'bar', 'cafe', 'restaurant'
	]
	var html = ''
	markers.forEach(function(m) {
		html = html + '<div class="map-menu-legend-item">'
			+ '<div class="map-menu-leg-img"><img src="marker/' + m + '.png" alt="' + m + '"></div>'
			+ '<div class="map-menu-leg-txt"><span>' + fix(m) + '</span></div>'
		+ '</div>'
	})
	return html
}

function fix(m) {
	var s = m.split('_')
	if(s.length === 1) { return m }
	else { return s[0] + ' ' + s[1] } 
}

},{"../../dom":19,"./icons":12}],14:[function(require,module,exports){
var icon = require('./icons')
var dom = require('../../dom')

module.exports = function(config) {
	view(config, function() {
		ctrl(config)
	})
}

function ctrl(config) {
	var e = config.evt
	dom.byId('map-menu-main-tourism').onclick = function() { e.emit('map-show-tourism') }
	dom.byId('map-menu-main-drink').onclick = function() { e.emit('map-show-drink') }
	dom.byId('map-menu-main-eat').onclick = function() { e.emit('map-show-eat') }
	dom.byId('map-menu-main-more').onclick = function() { e.emit('map-menu-more') }
}

function view(config, callback) {
	config.menu.className = 'map-menu-main-row'
	var html = '<div id="map-menu-main-tourism" class="map-menu-main-cell' + visible('tourism', config) + '">' + icon.tourism + '</div>'
	+ '<div id="map-menu-main-drink" class="map-menu-main-cell' + visible('drink', config) + '">' + icon.drink + '</div>'
	+ '<div id="map-menu-main-eat" class="map-menu-main-cell' + visible('eat', config) + '">' + icon.eat + '</div>'
	+ '<div id="map-menu-main-more" class="map-menu-main-cell' + visible('more', config) + '">' + icon.menu + '</div>'
	config.menu.innerHTML = html
	config.setMapHeight()
	callback()
}

function visible(n, config) {
	if(config.mapMenu.current === n) { return ' visible' }
	else { return '' }
}

},{"../../dom":19,"./icons":12}],15:[function(require,module,exports){
var icon = require('./icons')
var dom = require('../../dom')

module.exports = function(config) {
	view(config, function() {
		ctrl(config)
	})
}

function ctrl(config) {
	var e = config.evt
	dom.byId('map-menu-main-tourism').onclick = function() { e.emit('map-show-tourism') }
	dom.byId('map-menu-main-drink').onclick = function() { e.emit('map-show-drink') }
	dom.byId('map-menu-main-eat').onclick = function() { e.emit('map-show-eat') }
	dom.byId('map-menu-main-close').onclick = function() { e.emit('map-menu-more-close') }
	dom.byId('map-menu-more-change-city').onclick = function() { window.location.reload() }
	dom.byId('map-menu-more-legend').onclick = function() { e.emit('show-legend') }
}

function view(config, callback) {
	config.menu.className = ''
	var html = '<div class="map-menu-more">'
		+ '<div id="map-menu-more-change-city" class="map-menu-more-item"><span>Change city</span></div>'
		+ '<div id="map-menu-more-legend" class="map-menu-more-item"><span>Map legend</span></div>'
	+ '</div>'
	+ '<div class="map-menu-main-row">'
		+ '<div id="map-menu-main-tourism" class="map-menu-main-cell' + visible('tourism', config) + '">' + icon.tourism + '</div>'
		+ '<div id="map-menu-main-drink" class="map-menu-main-cell' + visible('drink', config) + '">' + icon.drink + '</div>'
		+ '<div id="map-menu-main-eat" class="map-menu-main-cell' + visible('eat', config) + '">' + icon.eat + '</div>'
		+ '<div id="map-menu-main-close" class="map-menu-main-cell' + visible('more', config) + '">' + icon.close + '</div>'
	+ '</div>'
	config.menu.innerHTML = html
	config.setMapHeight()
	callback()
}

function visible(n, config) {
	if(config.mapMenu.current === n) { return ' visible' }
	else { return '' }
}

},{"../../dom":19,"./icons":12}],16:[function(require,module,exports){
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

},{"../api/get-place":2,"./tourist-icon":17}],17:[function(require,module,exports){
module.exports = '<svg width="325" height="325" viewBox="0 0 325 325" id="svg2"><rect width="405.08829" height="385.61288" x="-44.793415" y="-40.163723" id="rect3788" style="fill:#ffffff;fill-opacity:1;stroke:none" /><path d="m -17.527859,131.21978 50.636037,-1.94754 0,97.377 16.554089,0 0,-17.52786 22.396708,0.97377 1.94754,17.52786 34.081945,-0.97377 -2.92131,-52.58358 22.39671,0 2.92131,45.76719 27.26556,0 0,-103.21962 39.92457,-1.94754 0,85.69176 38.95079,0.97377 0,-38.9508 26.29179,-87.639293 20.44917,88.613063 -0.97377,36.02949 26.29179,0 -2.92131,-30.18687 42.84588,-4.86885 0,186.96383 -356.3997995,5.84262 -31.1606375,-30.18687 z" id="path3016" style="fill:#ececec;stroke:none" /><g transform="translate(-116.85239,-255.12772)" id="layer1"> <g  transform="matrix(0.92986768,0,0,0.92986768,11.395078,41.641525)"  id="g3972"> <path  d="m 227.28432,447.28081 -1.01015,146.47212 114.14724,-4.04061 -7.07107,-164.65487 z"  id="path3841"  style="fill:#ff8080;stroke:none" /> <path  d="m 360.00001,335.21933 a 87.14286,80 0 1 1 -174.28572,0 87.14286,80 0 1 1 174.28572,0 z"  id="path2985"  style="fill:#e9c6af;fill-opacity:1;stroke:none" /> <path  d="m 384.86813,360.91275 a 36.87057,30.809655 0 1 1 -73.74114,0 36.87057,30.809655 0 1 1 73.74114,0 z"  id="path2987"  style="fill:#e9c6af;fill-opacity:1;stroke:none" /> <path  d="m 311.12698,319.74905 a 17.67767,16.414978 0 1 1 -35.35534,0 17.67767,16.414978 0 1 1 35.35534,0 z"  transform="translate(4.0406102,12.121831)"  id="path3770"  style="fill:#ffffff;fill-opacity:1;stroke:none" /> <path  d="m 311.12698,319.74905 a 17.67767,16.414978 0 1 1 -35.35534,0 17.67767,16.414978 0 1 1 35.35534,0 z"  transform="matrix(0.88571429,0,0,0.87692307,73.94317,38.091036)"  id="path3770-9"  style="fill:#ffffff;fill-opacity:1;stroke:none" /> <path  d="m 260.61936,356.87216 a 6.81853,6.0609159 0 1 1 -13.63706,0 6.81853,6.0609159 0 1 1 13.63706,0 z"  transform="matrix(0.92592595,0,0,1,67.539916,-17.677677)"  id="path3792"  style="fill:#1a1a1a;fill-opacity:1;stroke:none" /> <path  d="m 260.61936,356.87216 a 6.81853,6.0609159 0 1 1 -13.63706,0 6.81853,6.0609159 0 1 1 13.63706,0 z"  transform="matrix(0.74074076,0,0,0.79166667,148.12764,43.412435)"  id="path3792-3"  style="fill:#1a1a1a;fill-opacity:1;stroke:none" /> <path  d="m 240.41631,373.53967 c 13.41351,25.9403 32.63347,39.88059 66.16499,24.24366 -33.01447,3.87457 -46.91691,-13.10034 -66.16499,-24.24366 z"  id="path3821"  style="fill:#ffffff;stroke:none" /> <path  d="m 185.4676,341.09595 c -5.24793,-41.17959 43.5274,-125.94493 141.82182,-71.09691 -64.64882,14.8747 -108.12281,37.3832 -141.82182,71.09691 z"  id="path3823"  style="fill:#c6e9af;stroke:none" /> <path  d="m 250.90562,296.02841 c 25.50022,-8.33989 43.74892,-18.49598 75.10317,-25.5243 54.97782,-34.74037 -29.70035,-40.9468 -75.10317,25.5243 z"  id="path3825"  style="fill:#aade87;stroke:none" /> <path  d="m 253.54829,425.05745 -36.36549,9.09137 c -5.80699,2.56123 -10.64884,0.77933 -18.18275,11.11168 l -31.31473,44.44671 c -4.13951,11.25689 -13.09729,24.11986 10.10153,26.26397 l 98.99495,21.2132 5.05076,-27.27411 -84.85281,-15.15229 27.27412,-37.37565 85.86296,-21.2132 -10.10152,28.28427 c -4.59833,12.04092 3.72362,12.15542 11.11167,13.13198 l 71.72083,21.21321 4.04061,-20.20305 -60.60915,-14.14214 11.11168,-38.3858 c 1.40481,-9.91068 -8.94078,-11.07611 -20.86658,-9.56055 z"  id="path3839"  style="fill:#ff8080;stroke:none" /> <path  d="m 258.09397,409.65262 c -2.13117,7.6565 -3.89752,13.8537 -5.55583,19.61876 6.23402,2.65171 19.22261,8.94785 26.43728,0.6425 -3.82609,-6.66957 -5.18663,-13.33915 -7.24439,-20.00872 z"  id="path3837"  style="fill:#e9c6af;stroke:none" /> <path  d="m 218.21429,554.86218 c -8.60669,-31.89815 -14.86464,-78.74562 23.92857,-126.78571 -25.87029,33.57979 -34.21691,77.059 -23.92857,126.78571 z"  id="path3948"  style="fill:#1a1a1a;stroke:none" /> <path  d="m 261.62951,543.2453 c 51.35056,-28.45225 51.21479,-74.06661 37.37564,-124.24876 20.55396,61.51082 7.78438,102.73775 -37.37564,124.24876 z"  id="path3950"  style="fill:#1a1a1a;stroke:none" /> <path  d="m 278.8021,477.58538 16.16244,38.3858 -12.12183,58.58885 54.54824,3.03046 21.2132,-33.33504 46.46702,7.07107 8.08122,-27.27412 18.18275,-21.2132 -32.32488,-22.22336 0,-47.47717 -22.22336,17.1726 -13.13198,26.26396 -34.34519,-11.11168 -4.04061,20.20305 z"  id="path3835"  style="fill:#e9ddaf;stroke:none" /> <path  d="m 287.14286,513.79075 c 35.2235,4.52367 10.92659,25.01562 -2.85715,20.35715 -18.00691,-8.09325 -5.67077,-14.09388 2.85715,-20.35715 z"  id="path3865"  style="fill:#e9c6af;stroke:none" /> <path  d="m 397.67857,469.86218 c -8.38243,23.04244 7.66187,17.80129 15.89286,21.60714 1.04043,-9.95805 4.21789,-20.84525 -15.89286,-21.60714 z"  id="path3867"  style="fill:#e9c6af;stroke:none" /> <path  d="m 377.29198,450.31126 9.84898,62.882 -22.98097,-36.87057 z"  id="path3952"  style="opacity:0.07999998;fill:#1a1a1a;stroke:none" /> <path  d="m 329.81481,466.22117 16.92005,58.58885 -21.46574,-39.64849 z"  id="path3954"  style="opacity:0.07999998;fill:#1a1a1a;stroke:none" /> <path  d="m 358.35162,544.00291 -29.54697,-21.2132 8.5863,54.80078 z"  id="path3956"  style="opacity:0.07999998;fill:#1a1a1a;stroke:none" /> <path  d="m 227.14286,527.00504 44.64285,6.78571 -45.35714,-2.14285 z"  id="path3960"  style="opacity:0.07999998;fill:#1a1a1a;stroke:none" /> <path  d="m 210.89286,497.00504 6.96428,1.60714 -0.35714,25.89286 -7.85714,-1.96429 z"  id="path3962"  style="fill:#ff8080;stroke:none" /> <path  d="m 273.92857,567.00504 -4.64286,8.92857 -12.85714,4.28571 -0.71428,7.5 -11.42858,3.92858 -0.71428,-7.14286 -15,5.71428 -1.78572,-3.21428 0.35715,-8.92857 z"  id="path3964"  style="opacity:0.07999998;fill:#1a1a1a;stroke:none" /> <path  d="m 263.13196,540.86182 12.14286,24.28572 -46.42857,18.57143 -11.42857,-29.28572 z"  id="path3904"  style="fill:#1a1a1a;stroke:none" /> <path  d="m 216.80399,556.88236 0.63135,-2.39911 57.70496,10.48033 -0.88388,2.39911 z"  id="path3924"  style="fill:#1a1a1a;stroke:none" /> <path  d="m 262.41769,543.00468 12.14286,24.28572 -46.42857,18.57143 -11.42857,-29.28572 z"  id="path3904-7"  style="fill:#333333;stroke:none" /> <path  d="m 233.39285,592.89789 a 10.625,9.4642859 0 1 1 -21.25,0 10.625,9.4642859 0 1 1 21.25,0 z"  transform="translate(21.607143,-28.75)"  id="path3926"  style="fill:#1a1a1a;fill-opacity:1;stroke:none" /> <path  d="m 233.39285,592.89789 a 10.625,9.4642859 0 1 1 -21.25,0 10.625,9.4642859 0 1 1 21.25,0 z"  transform="translate(21.160719,-27.14285)"  id="path3926-7"  style="fill:#666666;fill-opacity:1;stroke:none" /> <path  d="m 235.44643,568.34432 c 1.683,4.74813 5.90631,6.47208 12.58928,5.26786 -6.02388,0.38799 -9.63226,-1.86716 -12.58928,-5.26786 z"  id="path3946"  style="fill:#999999;stroke:none" /> <path  d="m 335.87572,389.95465 c -13.0524,-3.03313 -28.88796,-4.50074 -21.2132,-19.1929 0.97154,12.90379 10.24541,16.95177 21.2132,19.1929 z"  id="path3966"  style="opacity:0.07999998;fill:#1a1a1a;stroke:none" /> <path  d="M 216.42857,269.50504 C 171.08734,315.32935 172.15498,394.28313 258.39286,414.68361 184.9249,374.58139 200.8989,320.73196 216.42857,269.50504 z"  id="path3968"  style="opacity:0.07999998;fill:#1a1a1a;stroke:none" /> <path  d="M 257.32143,414.32647 252.5,428.79075 c 1.80673,1.42857 6.48057,2.85715 10.53571,4.28572 -4.81963,-6.88385 -4.31167,-12.60919 -5.71428,-18.75 z"  id="path3970"  style="opacity:0.07999998;fill:#1a1a1a;stroke:none" /> </g></g></svg>'

},{}],18:[function(require,module,exports){
var dom = require('./dom')

module.exports = function(evt) {
	var o = this
	o.menu = dom.byId('menu')
	o.map = dom.byId('map')
	o.state = 'init-menu' // alt: ['map']
	o.setState = function(s) { o.state = s }
	o.evt = evt
	o.mapMenu = { current: 'tourism' }
	o.setMapHeight = function() {
		var mapH = window.innerHeight - o.menu.offsetHeight
		o.map.style.height = mapH + 'px'
	}
	o.collapseMenu = function() {
		dom.clear(o.menu)
		o.setMapHeight()
	}
}



},{"./dom":19}],19:[function(require,module,exports){
exports.byId = function(id) {
	return document.getElementById(id)
}
exports.byClass = function(cl) {
	var arr = []
	var els = document.getElementsByClassName(cl)
	for(i=0;i<els.length;i++) { arr.push(els[i]) }
	return arr
}
exports.byTag = function(tag) {
	var arr = []
	var els = document.getElementsByTagName(tag)
	for(i=0;i<els.length;i++) { arr.push(els[i]) }
	return arr
}
exports.clear = function(el) {
	while (el.firstChild) {el.removeChild(el.firstChild)}
}
exports.clearById = function(id) {
	var el = document.getElementById(id)
	while (el.firstChild) {el.removeChild(el.firstChild)}
}

},{}],20:[function(require,module,exports){
var searchPlace = require('./comp/search-place')
var choosePlace = require('./comp/choose-place')
var mapMenu = require('./comp/map-menu')
var mapInit = require('./map/init')
var getOverpass = require('./api/get-overpass')

module.exports = function(config) {
	var e = config.evt

	e.on('page-load', function() {
		searchPlace(e)
	})
	e.on('page-resize', function() {
		console.log('Page was resized')
		if(config.state === 'map') { config.setMapHeight() }
	})
	e.on('place-search-err', function(err) {
		console.log('place-search-err', err)
	})
	e.on('place-search-success', function(data) { 
		choosePlace(e, data)
	})
	e.on('place-coords', function(pt) {
		config.pt = pt
		getOverpass(pt, 'tourism', function(err, data) {
			if(err) { e.emit('tourism-data-err', err) }
			else { e.emit('tourism-data', data) }
		})
		config.collapseMenu()
		config.setState('map')
		mapInit('map', pt, config)
		mapMenu('main', config)
	})
	e.on('overpass-data-err', function(err) {
		console.log('overpass-data-err', err)
	})
	e.on('map-show-tourism', function() {
		if(config.mapData.data['tourism']) {
			e.emit('show-tourism-data')
		} else {
			getOverpass(config.pt, 'tourism', function(err, data) {
				if(err) { e.emit('overpass-data-err', err) }
				else { e.emit('tourism-data', data) }
			})
		}
		config.mapMenu.current = 'tourism'
		mapMenu('main', config)
	})
	e.on('map-show-drink', function() {
		if(config.mapData.data['drink']) {
			e.emit('show-drink-data')
		} else {
			getOverpass(config.pt, 'drink', function(err, data) {
				if(err) { e.emit('overpass-data-err', err) }
				else { e.emit('drink-data', data) }
			})
		}
		config.mapMenu.current = 'drink'
		mapMenu('main', config)
	})
	e.on('map-show-eat', function() {
		if(config.mapData.data['eat']) {
			e.emit('show-eat-data')
		} else {
			getOverpass(config.pt, 'eat', function(err, data) {
				if(err) { e.emit('overpass-data-err', err) }
				else { e.emit('eat-data', data) }
			})
		}
		config.mapMenu.current = 'eat'
		mapMenu('main', config)
	})
	e.on('map-menu-more', function() {
		config.mapMenu.prev = config.mapMenu.current
		config.mapMenu.current = 'more'
		mapMenu('more-menu', config)
	})
	e.on('map-menu-more-close', function() {
		config.mapMenu.current = config.mapMenu.prev
		config.mapMenu.prev = undefined
		mapMenu('main', config)
	})
	e.on('show-legend', function() {
		console.log('evt show-legend')
		mapMenu('legend', config)
	})
}



},{"./api/get-overpass":1,"./comp/choose-place":10,"./comp/map-menu":11,"./comp/search-place":16,"./map/init":24}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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

},{"./create-popup":23}],23:[function(require,module,exports){
function createPopup(props) {
	var html = '<p class="popup-main">'
		+ '<span class="popup-title">' + props.name + '</span><br/>'
	if(props.hist) { html = html + props.hist + '</br>' }
	if(props.cuisine) { html = html + props.cuisine + '</br>' }
	if(props.adr) { html = html +props.adr + '</br>' }
	if(props.hours) { html = html + 'Open:</br>'; props.hours.forEach(function(h) { html = html + h + '</br>' }) }
	if(props.phone) { html = html +'Phone: ' + props.phone + '</br>' }
	if(props.website) { html = html + '<a href="' + props.website + '" target="_blank">Website</a><br/>' }
	if(props.wiki) { html = html + '<a href="' + props.wiki + '" target="_blank">Wikipedia</a><br/>' }
	html = html + '</p>'
	return html
}

module.exports = function(properties) { return createPopup(properties) }

},{}],24:[function(require,module,exports){
var createIcons = require('./create-icons')
var createLayer = require('./create-layer')

module.exports = function(divId, pt, config) {
	var evt = config.evt
	var mapData = { layers: {}, data: {}, icons: createIcons() }
	var map = L.map(divId)
	map.setView(new L.LatLng(pt[1], pt[0]), 14)
	mapData.map = map
	config.mapData = mapData

	var tiles = L.tileLayer('http://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	attribution: 'Imagery from <a href="http://mapbox.com/about/maps/">MapBox</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd',
	id: 'mapbox.streets',
	accessToken: 'pk.eyJ1IjoiYW5kZXJzLWlkcmlzLW1hcHMiLCJhIjoiY2l3eGt0cDExMDFmcjJ6bHFoenh5YnpycSJ9.bqmpIY7CFFIOl7vgILaV0A'}).addTo(map)

	evt.on('tourism-data', function(data) {
		mapData.data['tourism'] = data
		rmLayers(mapData, function() {
			createLayer(mapData, 'tourism')
		})
	})
	evt.on('drink-data', function(data) {
		mapData.data['drink'] = data
		rmLayers(mapData, function() {
			createLayer(mapData, 'drink')
		})	})
	evt.on('eat-data', function(data) {
		mapData.data['eat'] = data
		rmLayers(mapData, function() {
			createLayer(mapData, 'eat')
		})
	})
	evt.on('show-tourism-data', function() {
		rmLayers(mapData, function() {
			createLayer(mapData, 'tourism')
		})
	})
	evt.on('show-drink-data', function() {
		rmLayers(mapData, function() {
			createLayer(mapData, 'drink')
		})
	})
	evt.on('show-eat-data', function() {
		rmLayers(mapData, function() {
			createLayer(mapData, 'eat')
		})
	})
}

function rmLayers(mapData, callback) {
	for(k in mapData.layers) {
		mapData.map.removeLayer(mapData.layers[k])
	}
	mapData.layers = {}
	callback()
}

},{"./create-icons":21,"./create-layer":22}],25:[function(require,module,exports){
var Emitter = require('events').EventEmitter
var events = require('./lib/events')
var Config = require('./lib/config')

window.onload = function() {
	var evt = new Emitter()
	var config = new Config(evt)
	window.config = config
	events(config)
	evt.emit('page-load')
	window.onresize = function() {
		evt.emit('page-resize')
	}
}



},{"./lib/config":18,"./lib/events":20,"events":26}],26:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[25]);
