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


