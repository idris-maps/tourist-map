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
