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
