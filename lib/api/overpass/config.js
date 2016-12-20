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

