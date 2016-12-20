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
