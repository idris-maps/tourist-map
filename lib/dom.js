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
