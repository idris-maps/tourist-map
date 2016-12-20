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

