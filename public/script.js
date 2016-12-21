(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
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
  } else if (listeners) {
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

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
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

},{}],2:[function(require,module,exports){
var data = require('../test-data')

module.exports = function(pt, type, callback) {
	data.overpass(pt, type, function(err, d) { callback(err,d) })
}

},{"../test-data":22}],3:[function(require,module,exports){
var data = require('../test-data')

module.exports = function(place, callback) {
	data.places(place, function(err, d) { callback(err,d) })
}

},{"../test-data":22}],4:[function(require,module,exports){
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
	var html = '<div id="menu-init"><h2>Choose city</h2>'
	var choices = {}
	places.forEach(function(p, i) {
		var id = 'place-' + i
		html = html + '<p id="' + id + '" class="places">' + p.name + '</p>'
		choices[id] = p.coords
	})
	document.getElementById('menu').innerHTML = html + '</div>'
	callback(choices)
}

},{}],5:[function(require,module,exports){
var main = require('./map-menu/main')
var more = require('./map-menu/more')
var legend = require('./map-menu/legend')

module.exports = function(state, config) {
	config.collapseMenu()
	if(state === 'main') { main(config) }
	else if(state === 'more-menu') { more(config) }
	else if(state === 'legend') { legend(config) }	
}

},{"./map-menu/legend":7,"./map-menu/main":8,"./map-menu/more":9}],6:[function(require,module,exports){
exports.drink = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 19" width="30"><title>Drink</title><rect fill="none" x="0" y="0" width="19" height="19"></rect><path fill="#000" transform="translate(2 2)" d="M12,5V2c0,0-1-1-4.5-1S3,2,3,2v3c0.0288,1.3915,0.3706,2.7586,1,4c0.6255,1.4348,0.6255,3.0652,0,4.5c0,0,0,1,3.5,1 s3.5-1,3.5-1c-0.6255-1.4348-0.6255-3.0652,0-4.5C11.6294,7.7586,11.9712,6.3915,12,5z M7.5,13.5 c-0.7966,0.035-1.5937-0.0596-2.36-0.28c0.203-0.7224,0.304-1.4696,0.3-2.22h4.12c-0.004,0.7504,0.097,1.4976,0.3,2.22 C9.0937,13.4404,8.2966,13.535,7.5,13.5z M7.5,5C6.3136,5.0299,5.1306,4.8609,4,4.5v-2C5.131,2.1411,6.3137,1.9722,7.5,2 C8.6863,1.9722,9.869,2.1411,11,2.5v2C9.8694,4.8609,8.6864,5.0299,7.5,5z"></path></svg>'

exports.eat = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 19" width="30"><title>Eat</title><rect fill="none" x="0" y="0" width="19" height="19"></rect><path fill="#000" transform="translate(2 2)" d="M3.5,0l-1,5.5c-0.1464,0.805,1.7815,1.181,1.75,2L4,14c-0.0384,0.9993,1,1,1,1s1.0384-0.0007,1-1L5.75,7.5 c-0.0314-0.8176,1.7334-1.1808,1.75-2L6.5,0H6l0.25,4L5.5,4.5L5.25,0h-0.5L4.5,4.5L3.75,4L4,0H3.5z M12,0 c-0.7364,0-1.9642,0.6549-2.4551,1.6367C9.1358,2.3731,9,4.0182,9,5v2.5c0,0.8182,1.0909,1,1.5,1L10,14c-0.0905,0.9959,1,1,1,1 s1,0,1-1V0z"></path></svg>'

exports.tourism = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 19" width="30"><title>Tourism</title><rect fill="none" x="0" y="0" width="19" height="19"></rect><path fill="#000" transform="translate(2 2)" d="M6,2C5.446,2,5.2478,2.5045,5,3L4.5,4h-2C1.669,4,1,4.669,1,5.5v5C1,11.331,1.669,12,2.5,12h10 c0.831,0,1.5-0.669,1.5-1.5v-5C14,4.669,13.331,4,12.5,4h-2L10,3C9.75,2.5,9.554,2,9,2H6z M2.5,5C2.7761,5,3,5.2239,3,5.5 S2.7761,6,2.5,6S2,5.7761,2,5.5S2.2239,5,2.5,5z M7.5,5c1.6569,0,3,1.3431,3,3s-1.3431,3-3,3s-3-1.3431-3-3S5.8431,5,7.5,5z M7.5,6.5C6.6716,6.5,6,7.1716,6,8l0,0c0,0.8284,0.6716,1.5,1.5,1.5l0,0C8.3284,9.5,9,8.8284,9,8l0,0C9,7.1716,8.3284,6.5,7.5,6.5 L7.5,6.5z"></path></svg>'

exports.menu = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 19" height="19" width="19"><title>Menu</title><path fill="#000" transform="translate(0 -3)" d="M 2 3 C 1.446 3 1 3.446 1 4 L 1 5 C 1 5.554 1.446 6 2 6 L 17 6 C 17.554 6 18 5.554 18 5 L 18 4 C 18 3.446 17.554 3 17 3 L 2 3 z M 2 8 C 1.446 8 1 8.446 1 9 L 1 10 C 1 10.554 1.446 11 2 11 L 17 11 C 17.554 11 18 10.554 18 10 L 18 9 C 18 8.446 17.554 8 17 8 L 2 8 z M 2 13 C 1.446 13 1 13.446 1 14 L 1 15 C 1 15.554 1.446 16 2 16 L 17 16 C 17.554 16 18 15.554 18 15 L 18 14 C 18 13.446 17.554 13 17 13 L 2 13 z"></path></svg>'

exports.close = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 19" height="19" width="19"><title>Close</title><path fill="#000" transform="translate(0 -3)" d="M 4.625 3.125 C 4.3693886 3.1230136 4.1036348 3.2119095 3.90625 3.40625 L 3.21875 4.09375 C 2.8239805 4.4824311 2.7988189 5.1364804 3.1875 5.53125 L 7.40625 9.8125 L 3.1875 14.125 C 2.7988189 14.51977 2.8239804 15.142569 3.21875 15.53125 L 3.90625 16.21875 C 4.3010196 16.607431 4.9550689 16.61352 5.34375 16.21875 L 9.53125 11.96875 L 13.71875 16.21875 C 14.107431 16.61352 14.73023 16.607431 15.125 16.21875 L 15.84375 15.53125 C 16.23852 15.142569 16.232431 14.48852 15.84375 14.09375 L 11.625 9.8125 L 15.84375 5.53125 C 16.232431 5.1364804 16.23852 4.5136811 15.84375 4.125 L 15.125 3.40625 C 14.73023 3.0175689 14.107431 3.0427304 13.71875 3.4375 L 9.53125 7.6875 L 5.34375 3.40625 C 5.1494095 3.2088652 4.8806114 3.1269864 4.625 3.125 z"></path></svg>'

},{}],7:[function(require,module,exports){
var icon = require('./icons')
var dom = require('../../dom')
var tmpl = require('./tmpl-main')

module.exports = function(config) {
	tmpl.view(config, extra(config), function() {
		tmpl.ctrl(config, extra(config))
	})
}

function extra(config) {
	return { 
		html: '<div class="map-menu-legend">' + legendView() + '</div>',
		ctrl: function() {
			dom.byId('map-menu-main-close').onclick = function() { config.evt.emit('map-menu-more-close') }
		}
	}
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


},{"../../dom":14,"./icons":6,"./tmpl-main":10}],8:[function(require,module,exports){
var icon = require('./icons')
var dom = require('../../dom')
var tmpl = require('./tmpl-main')

module.exports = function(config) {
	tmpl.view(config, null, function() {
		tmpl.ctrl(config, null)
	})
}


},{"../../dom":14,"./icons":6,"./tmpl-main":10}],9:[function(require,module,exports){
var icon = require('./icons')
var dom = require('../../dom')
var tmpl = require('./tmpl-main')

module.exports = function(config) {
	tmpl.view(config, extra(config), function() {
		tmpl.ctrl(config, extra(config))
	})
}

function extra(config) {
	var html = '<div class="map-menu-more">'
			+ '<div id="map-menu-more-change-city" class="map-menu-more-item"><span>Change city</span></div>'
			+ '<div id="map-menu-more-legend" class="map-menu-more-item"><span>Map symbols</span></div>'
		+ '</div>'
	return {
		html: html,
		ctrl: function() {
			var e = config.evt
			dom.byId('map-menu-main-close').onclick = function() { e.emit('map-menu-more-close') }
			dom.byId('map-menu-more-change-city').onclick = function() { window.location.reload() }
			dom.byId('map-menu-more-legend').onclick = function() { e.emit('show-legend') }
		}
	}
}


},{"../../dom":14,"./icons":6,"./tmpl-main":10}],10:[function(require,module,exports){
var icon = require('./icons')
var dom = require('../../dom')

function ctrl(config, extra) {
	var e = config.evt
	dom.byId('map-menu-main-tourism').onclick = function() { e.emit('map-show-tourism') }
	dom.byId('map-menu-main-drink').onclick = function() { e.emit('map-show-drink') }
	dom.byId('map-menu-main-eat').onclick = function() { e.emit('map-show-eat') }
	if(extra) {
		if(extra.ctrl) { extra.ctrl() }
	} else {
		dom.byId('map-menu-main-more').onclick = function() { e.emit('map-menu-more') }
	}
}

function view(config, extra, callback) {
	var html = ''
	if(extra) { 
		if(extra.html) { html = extra.html } 
		var btn = '<div id="map-menu-main-close" class="map-menu-main-cell' 
			+ visible('more', config) + '">' + icon.close + '</div>'
	} else {
		var btn = '<div id="map-menu-main-more" class="map-menu-main-cell' 
			+ visible('more', config) + '">' + icon.menu + '</div>'
	}
	html = html + '<div class="map-menu-main-row">'
		+ '<div id="map-menu-main-tourism" class="map-menu-main-cell' 
			+ visible('tourism', config) + '">' + icon.tourism + '</div>'
		+ '<div id="map-menu-main-drink" class="map-menu-main-cell' 
			+ visible('drink', config) + '">' + icon.drink + '</div>'
		+ '<div id="map-menu-main-eat" class="map-menu-main-cell' 
			+ visible('eat', config) + '">' + icon.eat + '</div>'
		+ btn
	+ '<div>'
	config.menu.innerHTML = html
	config.setMapHeight()
	callback()
}

function visible(n, config) {
	if(config.mapMenu.current === n) { return ' visible' }
	else { return '' }
}

exports.ctrl = ctrl
exports.view = view

},{"../../dom":14,"./icons":6}],11:[function(require,module,exports){
var place = require('../api/get-place-dev')
var icon = require('./tourist-icon')
module.exports = function(evt, searchError) {
	view(searchError, function() {
		ctrl(evt)
	})
}

function ctrl(evt) {
	document.getElementById('place-btn').onclick = function() {
		place(document.getElementById('place').value, function(err, data) { 
			if(err) { evt.emit('place-search-err', err) }
			else { 
				if(data.length === 0) { evt.emit('place-search-none') }
				else { 
					var five = []
					if(data.length > 5) { for(i=0;i<6;i++) { five.push(data[i]) } }
					else { five = data }
					evt.emit('place-search-success', five) 
				}
			}
		})
	}
}

function view(searchError, callback) {
	var html = '<div id="menu-init">'
		+ icon
		+ '<input id="place"/ placeholder="Search a city"><button id="place-btn">OK</button>'
	if(searchError) { html = html + '<p id="info">' + searchError + '</p>' }	
	html = html + '</div>'
	document.getElementById('menu').innerHTML = html
	callback()
}

},{"../api/get-place-dev":3,"./tourist-icon":12}],12:[function(require,module,exports){
module.exports = '<svg width="325" height="325" viewBox="0 0 325 325"><rect style="fill:#ffffff;fill-opacity:1;stroke:none" y="-40.163723" x="-44.793415" height="385.61288" width="405.08829"></rect><path style="fill:#b2793f;stroke:none;fill-opacity:1;opacity:0.2" id="path3016" d="m -17.527859,131.21978 50.636037,-1.94754 0,97.377 16.554089,0 0,-17.52786 22.396708,0.97377 1.94754,17.52786 34.081945,-0.97377 -2.92131,-52.58358 22.39671,0 2.92131,45.76719 27.26556,0 0,-103.21962 39.92457,-1.94754 0,85.69176 38.95079,0.97377 0,-38.9508 26.29179,-87.639293 20.44917,88.613063 -0.97377,36.02949 26.29179,0 -2.92131,-30.18687 42.84588,-4.86885 0,186.96383 -356.3997995,5.84262 -31.1606375,-30.18687 z" ></path><g id="layer1" transform="translate(-116.85239,-255.12772)" ><g   id="g3972"   transform="matrix(0.92986768,0,0,0.92986768,11.395078,41.641525)" ><path style="fill:#ce7668;stroke:none;fill-opacity:1" id="path3841" d="m 227.28432,447.28081 -1.01015,146.47212 114.14724,-4.04061 -7.07107,-164.65487 z" ></path><path style="fill:#e7bd92;fill-opacity:1;stroke:none" id="path2985" d="m 360.00001,335.21933 a 87.14286,80 0 1 1 -174.28572,0 87.14286,80 0 1 1 174.28572,0 z" ></path><path style="fill:#e7bd92;fill-opacity:1;stroke:none" id="path2987" d="m 384.86813,360.91275 a 36.87057,30.809655 0 1 1 -73.74114,0 36.87057,30.809655 0 1 1 73.74114,0 z" ></path><path style="fill:#ffffff;fill-opacity:1;stroke:none" id="path3770" transform="translate(4.0406102,12.121831)" d="m 311.12698,319.74905 a 17.67767,16.414978 0 1 1 -35.35534,0 17.67767,16.414978 0 1 1 35.35534,0 z" ></path><path style="fill:#ffffff;fill-opacity:1;stroke:none" id="path3770-9" transform="matrix(0.88571429,0,0,0.87692307,73.94317,38.091036)" d="m 311.12698,319.74905 a 17.67767,16.414978 0 1 1 -35.35534,0 17.67767,16.414978 0 1 1 35.35534,0 z" ></path><path style="fill:#1a1a1a;fill-opacity:1;stroke:none" id="path3792" transform="matrix(0.92592595,0,0,1,67.539916,-17.677677)" d="m 260.61936,356.87216 a 6.81853,6.0609159 0 1 1 -13.63706,0 6.81853,6.0609159 0 1 1 13.63706,0 z" ></path><path style="fill:#1a1a1a;fill-opacity:1;stroke:none" id="path3792-3" transform="matrix(0.74074076,0,0,0.79166667,148.12764,43.412435)" d="m 260.61936,356.87216 a 6.81853,6.0609159 0 1 1 -13.63706,0 6.81853,6.0609159 0 1 1 13.63706,0 z" ></path><path style="fill:#ffffff;stroke:none" id="path3821" d="m 240.41631,373.53967 c 13.41351,25.9403 32.63347,39.88059 66.16499,24.24366 -33.01447,3.87457 -46.91691,-13.10034 -66.16499,-24.24366 z" ></path><path style="fill:#8dbd9b;stroke:none;fill-opacity:1" id="path3823" d="m 185.4676,341.09595 c -5.24793,-41.17959 43.5274,-125.94493 141.82182,-71.09691 -64.64882,14.8747 -108.12281,37.3832 -141.82182,71.09691 z" ></path><path style="fill:#6cab7f;stroke:none;fill-opacity:1" id="path3825" d="m 250.90562,296.02841 c 25.50022,-8.33989 43.74892,-18.49598 75.10317,-25.5243 54.97782,-34.74037 -29.70035,-40.9468 -75.10317,25.5243 z" ></path><path style="fill:#ce7668;stroke:none;fill-opacity:1" id="path3839" d="m 253.54829,425.05745 -36.36549,9.09137 c -5.80699,2.56123 -10.64884,0.77933 -18.18275,11.11168 l -31.31473,44.44671 c -4.13951,11.25689 -13.09729,24.11986 10.10153,26.26397 l 98.99495,21.2132 5.05076,-27.27411 -84.85281,-15.15229 27.27412,-37.37565 85.86296,-21.2132 -10.10152,28.28427 c -4.59833,12.04092 3.72362,12.15542 11.11167,13.13198 l 71.72083,21.21321 4.04061,-20.20305 -60.60915,-14.14214 11.11168,-38.3858 c 1.40481,-9.91068 -8.94078,-11.07611 -20.86658,-9.56055 z" ></path><path style="fill:#e7bd92;stroke:none;fill-opacity:1" id="path3837" d="m 258.09397,409.65262 c -2.13117,7.6565 -3.89752,13.8537 -5.55583,19.61876 6.23402,2.65171 19.22261,8.94785 26.43728,0.6425 -3.82609,-6.66957 -5.18663,-13.33915 -7.24439,-20.00872 z" ></path><path style="fill:#1a1a1a;stroke:none" id="path3948" d="m 218.21429,554.86218 c -8.60669,-31.89815 -14.86464,-78.74562 23.92857,-126.78571 -25.87029,33.57979 -34.21691,77.059 -23.92857,126.78571 z" ></path><path style="fill:#1a1a1a;stroke:none" id="path3950" d="m 261.62951,543.2453 c 51.35056,-28.45225 51.21479,-74.06661 37.37564,-124.24876 20.55396,61.51082 7.78438,102.73775 -37.37564,124.24876 z" ></path><path style="fill:#9eb4ba;stroke:none;fill-opacity:1" id="path3835" d="m 278.8021,477.58538 16.16244,38.3858 -12.12183,58.58885 54.54824,3.03046 21.2132,-33.33504 46.46702,7.07107 8.08122,-27.27412 18.18275,-21.2132 -32.32488,-22.22336 0,-47.47717 -22.22336,17.1726 -13.13198,26.26396 -34.34519,-11.11168 -4.04061,20.20305 z" ></path><path style="fill:#e7bd92;stroke:none;fill-opacity:1" id="path3865" d="m 287.14286,513.79075 c 35.2235,4.52367 10.92659,25.01562 -2.85715,20.35715 -18.00691,-8.09325 -5.67077,-14.09388 2.85715,-20.35715 z" ></path><path style="fill:#e7bd92;stroke:none;fill-opacity:1" id="path3867" d="m 397.67857,469.86218 c -8.38243,23.04244 7.66187,17.80129 15.89286,21.60714 1.04043,-9.95805 4.21789,-20.84525 -15.89286,-21.60714 z" ></path><path style="opacity:0.07999998;fill:#1a1a1a;stroke:none" id="path3952" d="m 377.29198,450.31126 9.84898,62.882 -22.98097,-36.87057 z" ></path><path style="opacity:0.07999998;fill:#1a1a1a;stroke:none" id="path3954" d="m 329.81481,466.22117 16.92005,58.58885 -21.46574,-39.64849 z" ></path><path style="opacity:0.07999998;fill:#1a1a1a;stroke:none" id="path3956" d="m 358.35162,544.00291 -29.54697,-21.2132 8.5863,54.80078 z" ></path><path style="opacity:0.07999998;fill:#1a1a1a;stroke:none" id="path3960" d="m 227.14286,527.00504 44.64285,6.78571 -45.35714,-2.14285 z" ></path><path style="fill:#ce7668;stroke:none;fill-opacity:1" id="path3962" d="m 210.89286,497.00504 6.96428,1.60714 -0.35714,25.89286 -7.85714,-1.96429 z" ></path><path style="opacity:0.07999998;fill:#1a1a1a;stroke:none" id="path3964" d="m 273.92857,567.00504 -4.64286,8.92857 -12.85714,4.28571 -0.71428,7.5 -11.42858,3.92858 -0.71428,-7.14286 -15,5.71428 -1.78572,-3.21428 0.35715,-8.92857 z" ></path><path style="fill:#1a1a1a;stroke:none" id="path3904" d="m 263.13196,540.86182 12.14286,24.28572 -46.42857,18.57143 -11.42857,-29.28572 z" ></path><path style="fill:#1a1a1a;stroke:none" id="path3924" d="m 216.80399,556.88236 0.63135,-2.39911 57.70496,10.48033 -0.88388,2.39911 z" ></path><path style="fill:#333333;stroke:none" id="path3904-7" d="m 262.41769,543.00468 12.14286,24.28572 -46.42857,18.57143 -11.42857,-29.28572 z" ></path><path style="fill:#1a1a1a;fill-opacity:1;stroke:none" id="path3926" transform="translate(21.607143,-28.75)" d="m 233.39285,592.89789 a 10.625,9.4642859 0 1 1 -21.25,0 10.625,9.4642859 0 1 1 21.25,0 z" ></path><path style="fill:#666666;fill-opacity:1;stroke:none" id="path3926-7" transform="translate(21.160719,-27.14285)" d="m 233.39285,592.89789 a 10.625,9.4642859 0 1 1 -21.25,0 10.625,9.4642859 0 1 1 21.25,0 z" ></path><path style="fill:#999999;stroke:none" id="path3946" d="m 235.44643,568.34432 c 1.683,4.74813 5.90631,6.47208 12.58928,5.26786 -6.02388,0.38799 -9.63226,-1.86716 -12.58928,-5.26786 z" ></path><path style="opacity:0.07999998;fill:#1a1a1a;stroke:none" id="path3966" d="m 335.87572,389.95465 c -13.0524,-3.03313 -28.88796,-4.50074 -21.2132,-19.1929 0.97154,12.90379 10.24541,16.95177 21.2132,19.1929 z" ></path><path style="opacity:0.07999998;fill:#1a1a1a;stroke:none" id="path3968" d="M 216.42857,269.50504 C 171.08734,315.32935 172.15498,394.28313 258.39286,414.68361 184.9249,374.58139 200.8989,320.73196 216.42857,269.50504 z" ></path><path style="opacity:0.07999998;fill:#1a1a1a;stroke:none" id="path3970" d="M 257.32143,414.32647 252.5,428.79075 c 1.80673,1.42857 6.48057,2.85715 10.53571,4.28572 -4.81963,-6.88385 -4.31167,-12.60919 -5.71428,-18.75 z" ></path></g ></g></svg>'

},{}],13:[function(require,module,exports){
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



},{"./dom":14}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
var searchPlace = require('./comp/search-place')
var choosePlace = require('./comp/choose-place')
var mapMenu = require('./comp/map-menu')
var mapInit = require('./map/init')
var getOverpass = require('./api/get-overpass-dev')

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
	e.on('place-search-none', function() {
		searchPlace(e, 'Could not find this city, try another spelling')	
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



},{"./api/get-overpass-dev":2,"./comp/choose-place":4,"./comp/map-menu":5,"./comp/search-place":11,"./map/init":19}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{"./create-popup":18}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
var createIcons = require('./create-icons')
var createLayer = require('./create-layer')

module.exports = function(divId, pt, config) {
	var evt = config.evt
	var mapData = { layers: {}, data: {}, icons: createIcons() }
	var map = L.map(divId)
	map.setView(new L.LatLng(pt[1], pt[0]), 15)
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

},{"./create-icons":16,"./create-layer":17}],20:[function(require,module,exports){
module.exports=﻿[{"type":"Feature","properties":{"name":"Buvette Dreirosen","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5863581,47.5694909]}},{"type":"Feature","properties":{"name":"Kiki Bar","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5941997,47.5692456]}},{"type":"Feature","properties":{"name":"Senat Maki's","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5938822,47.5692456]}},{"type":"Feature","properties":{"name":"Brasil Bar","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5901309,47.5694062]}},{"type":"Feature","properties":{"name":"Per Tutti","adr":"Breisacherstrasse, 73","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5886017,47.5673398]}},{"type":"Feature","properties":{"name":"Ticino","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5901833,47.567713]}},{"type":"Feature","properties":{"name":"Buvette Kaserne","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5889067,47.5628147]}},{"type":"Feature","properties":{"name":"Cargo Bar","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5843179,47.5641143]}},{"type":"Feature","properties":{"name":"Da Graziella","web":"http://www.dagraziella.com/im-kleinbasel/","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5928691,47.5664559]}},{"type":"Feature","properties":{"name":"Templum","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5809515,47.5504727]}},{"type":"Feature","properties":{"name":"Sport Pub Milan","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5948146,47.5689609]}},{"type":"Feature","properties":{"name":"Starbucks Centralbahnplatz","adr":"Centralbahnplatz, 14","web":"http://www.starbucks.ch/store-locator/search/location/Basel-Stadt%2C%20Schweiz/detail/1473","type":"cafe","phone":"+41 61 2713933"},"geometry":{"type":"Point","coordinates":[7.5900613,47.5487806]}},{"type":"Feature","properties":{"name":"Elisabethen","adr":"Elisabethenstrasse 10","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5911796,47.5526427]}},{"type":"Feature","properties":{"name":"Starbucks","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.589022,47.5534373]}},{"type":"Feature","properties":{"name":"Cafe und Apero Carla","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5867114,47.5503535]}},{"type":"Feature","properties":{"name":"Red Rocks","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5870516,47.5505709]}},{"type":"Feature","properties":{"name":"Rio Bar","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5887335,47.5544647]}},{"type":"Feature","properties":{"name":"Didi Bar","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5934442,47.5656436]}},{"type":"Feature","properties":{"name":"Saint Tropez","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5940531,47.5651584]}},{"type":"Feature","properties":{"name":"Clara","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.592551,47.5644905]}},{"type":"Feature","properties":{"name":"Internet Dome","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5885541,47.5521051]}},{"type":"Feature","properties":{"name":"Space Liner","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5883614,47.5524158]}},{"type":"Feature","properties":{"name":"Club 59","web":"http://www.club59.ch/de/","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5888576,47.5529871]}},{"type":"Feature","properties":{"name":"Mr Pickwick","adr":"Steinenvorstadt, 13","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5890303,47.5535209]}},{"type":"Feature","properties":{"name":"Museumscafe","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5892492,47.5540048]}},{"type":"Feature","properties":{"name":"Kiosk Caffee Park","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5690083,47.564525]}},{"type":"Feature","properties":{"name":"Cafe Haltestelle","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5876559,47.5451857]}},{"type":"Feature","properties":{"name":"Kaffeerösterei La Columbiana","adr":"Güterstrasse, 112","web":"http://www.lacolumbiana.ch","type":"cafe","phone":"+4161361 02 12","hours":["Tu-Fr 08:00-12:00, 14:00-18:00","Sa 10:00-12:00"]},"geometry":{"type":"Point","coordinates":[7.5872004,47.5455491]}},{"type":"Feature","properties":{"name":"Cafe Helvetia","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5678475,47.5600912]}},{"type":"Feature","properties":{"name":"Hinter dem Bahnhof geht die Sonne unter","adr":"Vogesenplatz, 1","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5724076,47.570422]}},{"type":"Feature","properties":{"name":"Café City-Chicken","type":"cafe","phone":"061 681 97 90"},"geometry":{"type":"Point","coordinates":[7.5909437,47.5660236]}},{"type":"Feature","properties":{"name":"Alpenblick","web":"http://www.bar-alpenblick.ch/","type":"bar","phone":"061 692 11 55","hours":["Tu-Th 20:00-01:00","Fr-Sa 20:00-02:00"]},"geometry":{"type":"Point","coordinates":[7.5909695,47.5659372]}},{"type":"Feature","properties":{"name":"EG Lounge","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5910618,47.5636906]}},{"type":"Feature","properties":{"name":"d'bar","adr":"Birsigparkplatz, 20","web":"http://www.dbar.ch/Website_dbar/Home.html","type":"bar","phone":"+41 (0)61 228 71 71","hours":["Tu-Th 16:00-24:00","Fr-Sa 16:00-02:00"]},"geometry":{"type":"Point","coordinates":[7.5892885,47.5531283]}},{"type":"Feature","properties":{"name":"Kirschgärtli","adr":"Kirschgartenstrasse, 12","type":"cafe","phone":"+41 61 272 82 11"},"geometry":{"type":"Point","coordinates":[7.591718,47.551437]}},{"type":"Feature","properties":{"name":"Café Siesta","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5965148,47.5690053]}},{"type":"Feature","properties":{"name":"Musical Bar","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5973736,47.5690036]}},{"type":"Feature","properties":{"name":"Stadtstrand Basel","web":"http://basel.city-beach.ch/","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5843059,47.5499512]}},{"type":"Feature","properties":{"name":"Ysefrässer Bar","adr":"Steinenbachgässlein, 42","web":"www.schnoogekerzli.ch/","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5873188,47.5520913]}},{"type":"Feature","properties":{"name":"La Cuna - Das Mediencafé","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.592274,47.566339]}},{"type":"Feature","properties":{"name":"Atlantis","adr":"Klosterberg, 13","web":"http://atlan-tis.ch/de/","type":"bar"},"geometry":{"type":"Point","coordinates":[7.590771,47.5519809]}},{"type":"Feature","properties":{"name":"unternehmen mitte","adr":"Gerbergasse, 30","web":"http://www.mitte.ch","type":"cafe","phone":"061 263 36 63"},"geometry":{"type":"Point","coordinates":[7.5883607,47.5565748]}},{"type":"Feature","properties":{"name":"Café frühling","adr":"Klybeckstrasse, 69","web":"http://www.cafe-fruehling.ch","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5903535,47.5677589]}},{"type":"Feature","properties":{"name":"Grand Cafe Huguenin","adr":"Barfüsserplatz, 6","web":"http://www.cafe-huguenin.ch/","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5899719,47.5550409]}},{"type":"Feature","properties":{"name":"Café zum Roten Engel","adr":"Andreasplatz, 15","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5863996,47.5582729]}},{"type":"Feature","properties":{"name":"Tchibo","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5896143,47.5481908]}},{"type":"Feature","properties":{"name":"Qbarana Lounge Bar","adr":"Erlenstrasse, 58","type":"bar"},"geometry":{"type":"Point","coordinates":[7.6018111,47.5687669]}},{"type":"Feature","properties":{"name":"Jêle","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5758801,47.5663556]}},{"type":"Feature","properties":{"name":"Oetlinger-Buvette","adr":"Unterer Rheinweg","web":"http://www.oetlinger-buvette.ch","type":"bar","phone":"+4178 652 52 58","hours":["Mo-Su 11:00-23:00"]},"geometry":{"type":"Point","coordinates":[7.5865225,47.5670708]}},{"type":"Feature","properties":{"name":"Volkshaus Basel","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5936892,47.5611108]}},{"type":"Feature","properties":{"name":"KABAR","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5908456,47.5636143]}},{"type":"Feature","properties":{"name":"ALL BAR ONE","adr":"Steinenvorstadt, 37","web":"http://www.kitchenbrew.ch/","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5888052,47.5529107]}},{"type":"Feature","properties":{"name":"Primidoofe Clique Basel 1991 Käller","adr":"Martinsgasse, 13","web":"www.primidoofe.ch","type":"bar","phone":"+41 61 261 66 69"},"geometry":{"type":"Point","coordinates":[7.5898917,47.5578824]}},{"type":"Feature","properties":{"name":"Erea","adr":"Brombacherstrasse, 6","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5955243,47.5704484]}},{"type":"Feature","properties":{"name":"Consum","adr":"Rheingasse, 19","web":"http://consumbasel.ch","type":"bar","hours":["17:00+"]},"geometry":{"type":"Point","coordinates":[7.5920448,47.5602389]}},{"type":"Feature","properties":{"name":"Pianobar","adr":"Riehenring, 71","type":"bar","hours":["Mo-Tu 11:00-01:00","Fr-Sa 11:00-02:00","Su 11:00-01:00","PH"]},"geometry":{"type":"Point","coordinates":[7.5987569,47.5638449]}},{"type":"Feature","properties":{"name":"Carambolage","adr":"Erlenstrasse, 34","web":"http://www.crmblg.ch/","type":"bar"},"geometry":{"type":"Point","coordinates":[7.6004231,47.5683278]}},{"type":"Feature","properties":{"name":"Tai Pan Sportsbar & Karaoke","adr":"Maulbeerstrasse, 36","type":"bar"},"geometry":{"type":"Point","coordinates":[7.6012604,47.5670847]}},{"type":"Feature","properties":{"name":"Podium","adr":"Amerbachstrasse, 14","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5912586,47.5692087]}},{"type":"Feature","properties":{"name":"Pasticceria Casanova","adr":"Spalenvorstadt, 12","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5830502,47.5573949]}},{"type":"Feature","properties":{"name":"Höheners Gnussegge","adr":"Spalenvorstadt, 41","web":"http://hoeheners-gnussegge.ch/filialen/spalenvorstadt.html","type":"cafe","phone":"+41 61 261 9955"},"geometry":{"type":"Point","coordinates":[7.5817264,47.5577176]}},{"type":"Feature","properties":{"name":"Gemeinsam Café","adr":"Markgräflerstrasse, 14","type":"cafe","phone":"+41 61 631 37 37","hours":["Mo.-Sa. 09.00-19.00h"]},"geometry":{"type":"Point","coordinates":[7.5910258,47.5698858]}},{"type":"Feature","properties":{"name":"Brändli's Espresso","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5885859,47.5529971]}},{"type":"Feature","properties":{"name":"Sheri's Café Bar","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5743702,47.5614009]}},{"type":"Feature","properties":{"name":"Schiesser","web":"http://www.confiserie-schiesser.ch/tea-room.php","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5926407,47.5536178]}},{"type":"Feature","properties":{"name":"Bar Rouge","web":"http://www.barrouge.ch/","type":"bar"},"geometry":{"type":"Point","coordinates":[7.6019009,47.5644556]}},{"type":"Feature","properties":{"name":"CaPuccini","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.597009,47.5629082]}},{"type":"Feature","properties":{"name":"Angels' Share","web":"http://angelsshare.bar/","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5912991,47.5664493]}},{"type":"Feature","properties":{"name":"Friends Bar","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5906595,47.5663194]}},{"type":"Feature","properties":{"name":"Café Bar Rosenkranz","adr":"St. Johanns-Ring, 120","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5762712,47.5634301]}},{"type":"Feature","properties":{"name":"Kaffebar Saint Louis","adr":"Elsässerstrasse, 29","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5801469,47.5682433]}},{"type":"Feature","properties":{"name":"Volta Bräu","adr":"Voltastrasse, 30","web":"www.voltabraeu.ch","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5795463,47.5709666]}},{"type":"Feature","properties":{"name":"Conto 4056","adr":"Gasstrasse, 1","web":"www.conto4056.com","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5780681,47.5704112]}},{"type":"Feature","properties":{"name":"Flore","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5912772,47.5648065]}},{"type":"Feature","properties":{"name":"KaBar","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5906279,47.5635638]}},{"type":"Feature","properties":{"name":"Didi Offensiv - Fussballkulturbar","web":"http://didioffensiv.ch","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5893309,47.5656871]}},{"type":"Feature","properties":{"name":"Internetcafé Planet13","adr":"Klybeckstrasse, 60","web":"https://planet13.ch","type":"cafe","phone":"+41 61 322 13 13"},"geometry":{"type":"Point","coordinates":[7.5913444,47.56559]}},{"type":"Feature","properties":{"name":"Johanniter Café - Bar","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5834065,47.5645288]}},{"type":"Feature","properties":{"name":"Grenzwert","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5919289,47.5603422]}},{"type":"Feature","properties":{"name":"Eccetera","adr":"Mittlere Strasse, 26","web":"http://www.caffeeccetera.ch/","type":"cafe","hours":["Mo-Fr 09:00-19:00","Sa 12:00-17:00"]},"geometry":{"type":"Point","coordinates":[7.5788559,47.5611456]}},{"type":"Feature","properties":{"name":"Johnny Parker","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.5814012,47.568022299999996]}},{"type":"Feature","properties":{"name":"Starbucks Claraplatz","adr":"Rebgasse, 2","web":"http://www.starbucks.ch/store-locator/search/detail/1464","type":"cafe","phone":"+41 61 6835777"},"geometry":{"type":"Point","coordinates":[7.59327355,47.56139305]}},{"type":"Feature","properties":{"name":"Spettacolo","type":"cafe","hours":["Mo-Th 05:00-21:00","Fr 05:00-23:00","Sa 05:30-23:00","Su 05:30-21:00"]},"geometry":{"type":"Point","coordinates":[7.588954,47.547041199999995]}},{"type":"Feature","properties":{"name":"Le Central Cafe Bar","type":"cafe"},"geometry":{"type":"Point","coordinates":[7.589332349999999,47.5477784]}},{"type":"Feature","properties":{"name":"Hirscheneck","adr":"Lindenberg, 23","type":"bar"},"geometry":{"type":"Point","coordinates":[7.5953057,47.5590428]}}]
},{}],21:[function(require,module,exports){
module.exports=﻿[{"type":"Feature","properties":{"name":"Restaurant Wilde Maa","type":"restaurant","web":"http://www.restaurant-wilde-maa.ch/"},"geometry":{"type":"Point","coordinates":[7.595093,47.5679494]}},{"type":"Feature","properties":{"name":"Firenze","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5944428,47.5692427]}},{"type":"Feature","properties":{"name":"Paladium","adr":"Amerbachstrasse, 14","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5913551,47.5692033]}},{"type":"Feature","properties":{"name":"Neptun","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5905324,47.5691367]}},{"type":"Feature","properties":{"name":"Pizzeria Breisacherhof","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5916214,47.5698877]}},{"type":"Feature","properties":{"name":"Eintracht","adr":"Oetlingerstrasse, 64","type":"restaurant","web":"http://www.megableu.ch/","cuisine":"regional","phone":"061 691 44 10","hours":["Mo off","Tu-Fr 08:30-24:00","Sa 09:30-24:00","Su 10:30-14:00"]},"geometry":{"type":"Point","coordinates":[7.5903738,47.5675379]}},{"type":"Feature","properties":{"name":"Gatto Nero","adr":"Oetlingerstrasse, 63","type":"restaurant","web":"https://www.facebook.com/gatto.nero.90410","cuisine":"italian, regional","phone":"+41 61 681 50 56","hours":["Tu-Fr 11:00-14:00,17:00-21:30","Sa 11:00-22:00"]},"geometry":{"type":"Point","coordinates":[7.5906834,47.5677788]}},{"type":"Feature","properties":{"name":"Zum Goldenen Fass","type":"restaurant","web":"http://www.goldenes-fass.ch/"},"geometry":{"type":"Point","coordinates":[7.5956372,47.5656669]}},{"type":"Feature","properties":{"name":"Bowling","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5850921,47.5465439]}},{"type":"Feature","properties":{"name":"100","adr":"Güterstrasse","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5864122,47.5458622]}},{"type":"Feature","properties":{"name":"zem Stänzler","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5886998,47.5659327]}},{"type":"Feature","properties":{"name":"zem Waijebläch","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5917694,47.5665578]}},{"type":"Feature","properties":{"name":"Chez Donati","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5841104,47.5642081]}},{"type":"Feature","properties":{"name":"Gasthof zum Goldenen Sternen","adr":"St. Alban-Rheinweg, 70","type":"restaurant","web":"http://www.sternen-basel.ch","phone":"+41 61 2721666","hours":["Mo-Sa 11:00-23:30"]},"geometry":{"type":"Point","coordinates":[7.6020008,47.5548054]}},{"type":"Feature","properties":{"name":"Parterre","adr":"Klybeckstrasse, 1b","type":"restaurant","web":"http://www.parterre-one.net","phone":"+41616958998"},"geometry":{"type":"Point","coordinates":[7.5912602,47.5637639]}},{"type":"Feature","properties":{"name":"Brauerei Fischerstube","adr":"Rheingasse, 45","type":"restaurant","web":"http://uelibier.ch/","phone":"+41 61 692 9495"},"geometry":{"type":"Point","coordinates":[7.5932236,47.5593065]}},{"type":"Feature","properties":{"name":"Brombi","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5962519,47.5705197]}},{"type":"Feature","properties":{"name":"Erlengarten","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5962724,47.5713261]}},{"type":"Feature","properties":{"name":"Zum Onkel","adr":"Mörsbergerstrasse, 2","type":"restaurant","web":"http://zum-onkel.ch","cuisine":"regional","phone":"+41 61 554 65 30","hours":["MO: geschlossen, DI.-FR: 9:00 - 24:00, SA: 10:00 - 24:00, SO: 10:00 - 16:00"]},"geometry":{"type":"Point","coordinates":[7.5941398,47.5659948]}},{"type":"Feature","properties":{"name":"Jägerhalle","type":"restaurant","web":"http://www.jaegerhalle.bs/"},"geometry":{"type":"Point","coordinates":[7.6016624,47.56909]}},{"type":"Feature","properties":{"name":"Sukhothai","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5802149,47.5496409]}},{"type":"Feature","properties":{"name":"Oliv","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5812177,47.5503881]}},{"type":"Feature","properties":{"name":"Schützenhaus","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5775537,47.5537153]}},{"type":"Feature","properties":{"name":"Tapadera zum Krug","type":"restaurant","cuisine":"mexican"},"geometry":{"type":"Point","coordinates":[7.5861986,47.5494117]}},{"type":"Feature","properties":{"name":"Acqua","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5845322,47.5498101]}},{"type":"Feature","properties":{"name":"Marmaris","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5753667,47.5561533]}},{"type":"Feature","properties":{"name":"Le Train Bleu","adr":"Centralbahnplatz, 3","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5906059,47.5479389]}},{"type":"Feature","properties":{"name":"Mister Wong","adr":"Centralbahnplatz, 1","type":"restaurant","cuisine":"asian"},"geometry":{"type":"Point","coordinates":[7.5906998,47.5480755]}},{"type":"Feature","properties":{"name":"Pizzeria Rafik Sandwich","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5938062,47.5522901]}},{"type":"Feature","properties":{"name":"Café Papiermühle","adr":"Sankt Alban-Tal, 35","type":"restaurant","web":"http://www.papiermuseum.ch","cuisine":"coffee shop"},"geometry":{"type":"Point","coordinates":[7.6031676,47.5547076]}},{"type":"Feature","properties":{"name":"Paddy Reilly's Irish Pub & Restauran","adr":"Steinentorstrasse, 45","type":"restaurant","web":"http://www.irish-pub.ch/"},"geometry":{"type":"Point","coordinates":[7.5879883,47.5510592]}},{"type":"Feature","properties":{"name":"Tacoteca","adr":"Viaduktstrasse, 12","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5865609,47.5489855]}},{"type":"Feature","properties":{"name":"Flügelrad","type":"restaurant","cuisine":"pizza"},"geometry":{"type":"Point","coordinates":[7.5885824,47.5489262]}},{"type":"Feature","properties":{"name":"Bombay Palace","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5869054,47.5507514]}},{"type":"Feature","properties":{"name":"Da Roberto","adr":"Küchengasse, 3","type":"restaurant","cuisine":"pizza","hours":["Mo-Fr 11:45-14:00,17:30-23:00"]},"geometry":{"type":"Point","coordinates":[7.5895375,47.5487965]}},{"type":"Feature","properties":{"name":"Restaurant Schlüsselzunft","adr":"Freie Strasse, 25","type":"restaurant","web":"http://www.schluesselzunft.ch","phone":"+41 61 2612046"},"geometry":{"type":"Point","coordinates":[7.5891969,47.5571682]}},{"type":"Feature","properties":{"name":"Ristorante Coccodrillo","adr":"Rümelinsplatz, 19","type":"restaurant","phone":"+41 61 262 33 36"},"geometry":{"type":"Point","coordinates":[7.587045,47.556807]}},{"type":"Feature","properties":{"name":"Zum Braunen Mutz","adr":"Barfüsserplatz, 10","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5887267,47.5543447]}},{"type":"Feature","properties":{"name":"Papa Joes Restaurant & Bar","adr":"Barfüsserplatz, 8","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.589475,47.554386]}},{"type":"Feature","properties":{"name":"Urbanstube","type":"restaurant","cuisine":"pizza"},"geometry":{"type":"Point","coordinates":[7.5864762,47.5609717]}},{"type":"Feature","properties":{"name":"Pizza Picobello","type":"restaurant","cuisine":"pizza"},"geometry":{"type":"Point","coordinates":[7.5873115,47.5607513]}},{"type":"Feature","properties":{"name":"Pinguin","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5818349,47.5564513]}},{"type":"Feature","properties":{"name":"King Curry","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5842004,47.5526669]}},{"type":"Feature","properties":{"name":"Klybeck Casino","type":"restaurant","cuisine":"regional"},"geometry":{"type":"Point","coordinates":[7.5916896,47.5644661]}},{"type":"Feature","properties":{"name":"Basilisk","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.592183,47.5632537]}},{"type":"Feature","properties":{"name":"Lällenkönig","adr":"Blumenrain, 1","type":"restaurant","cuisine":"regional"},"geometry":{"type":"Point","coordinates":[7.5881831,47.5595735]}},{"type":"Feature","properties":{"name":"Badischer Hof","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5976059,47.566018]}},{"type":"Feature","properties":{"name":"Punta Cana","type":"restaurant","web":"http://www.punta-cana-basel.ch/"},"geometry":{"type":"Point","coordinates":[7.5962178,47.5633753]}},{"type":"Feature","properties":{"name":"Bali","adr":"Clarastrasse, 27","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5967972,47.562794]}},{"type":"Feature","properties":{"name":"Rheinfelder Hof","adr":"Hammerstrasse, 61","type":"restaurant","web":"http://rheinfelderhof.ch/"},"geometry":{"type":"Point","coordinates":[7.5967588,47.562527]}},{"type":"Feature","properties":{"name":"Hecht am Rhein","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5915475,47.5604954]}},{"type":"Feature","properties":{"name":"Malay Thai","adr":"Rosentalstrasse, 40","type":"restaurant","web":"http://www.malaithai-restaurant.ch/"},"geometry":{"type":"Point","coordinates":[7.605048,47.5653158]}},{"type":"Feature","properties":{"name":"Warteck Bier","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.6073321,47.5658444]}},{"type":"Feature","properties":{"name":"Hong Kong","adr":"Riehenring, 91","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5981445,47.5651063]}},{"type":"Feature","properties":{"name":"Holzschopf","adr":"Clarastrasse, 1","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5947687,47.5621229]}},{"type":"Feature","properties":{"name":"Altes Warteck","adr":"Clarastrasse, 57","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5989171,47.5635246]}},{"type":"Feature","properties":{"name":"Balthazar","adr":"Kohlenberggasse, 23","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5873753,47.5523501]}},{"type":"Feature","properties":{"name":"Sam's Pizza Land","adr":"Steinenvorstadt, 30","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5885439,47.55288]}},{"type":"Feature","properties":{"name":"Tibits","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5890314,47.5525922]}},{"type":"Feature","properties":{"name":"Harem","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5881987,47.5519035]}},{"type":"Feature","properties":{"name":"Bosporus","type":"restaurant","cuisine":"anatolian"},"geometry":{"type":"Point","coordinates":[7.5883757,47.5519732]}},{"type":"Feature","properties":{"name":"Negishi Sushi Bar","adr":"Stänzlergasse, 7","type":"restaurant","web":"https://www.negishi.ch/basel-steinen","cuisine":"sushi","phone":"+41 61 271 64 46","hours":["11:00-23:00"]},"geometry":{"type":"Point","coordinates":[7.5893759,47.5527239]}},{"type":"Feature","properties":{"name":"Manger & Boire","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5887978,47.5552652]}},{"type":"Feature","properties":{"name":"Clipper","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5697715,47.5684354]}},{"type":"Feature","properties":{"name":"Beau-Site","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5714641,47.5633269]}},{"type":"Feature","properties":{"name":"Strassburgerhof","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5687628,47.5616169]}},{"type":"Feature","properties":{"name":"Park","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5709604,47.5675088]}},{"type":"Feature","properties":{"name":"Zum Tell","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5818763,47.5578829]}},{"type":"Feature","properties":{"name":"Pinar","adr":"Herbergsgasse, 1","type":"restaurant","cuisine":"turkish","phone":"0612610239"},"geometry":{"type":"Point","coordinates":[7.5858415,47.5600294]}},{"type":"Feature","properties":{"name":"Al Giardino","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5735269,47.5623768]}},{"type":"Feature","properties":{"name":"Kaffi Sandwich","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5985723,47.5595994]}},{"type":"Feature","properties":{"name":"City Kebab","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5952952,47.5671452]}},{"type":"Feature","properties":{"name":"Union","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5902334,47.5690588]}},{"type":"Feature","properties":{"name":"Wasabi","adr":"Güterstrasse, 138","type":"restaurant","web":"wasabi2go.ch","cuisine":"japanese","phone":"061 363 00 00","hours":["Mo-Fr 11:30-14:00,16:30-20:00","Sa 11:30-18:00"]},"geometry":{"type":"Point","coordinates":[7.5891681,47.5447841]}},{"type":"Feature","properties":{"name":"Asian Restaurant Kannenfeld","adr":"Entenweidstrasse, 4","type":"restaurant","cuisine":"chinese","phone":"0613217894"},"geometry":{"type":"Point","coordinates":[7.5737668,47.5658292]}},{"type":"Feature","properties":{"name":"Pizzeria Da Gianni","adr":"Elsässerstrasse, 1","type":"restaurant","web":"http://www.baizer.ch/restaurantfuehrer/restaurant.cfm?lang=d&ID=490&md=zo&vl=10&bs=st&start=51&Nr=5","cuisine":"italian","phone":"0613224233"},"geometry":{"type":"Point","coordinates":[7.5812027,47.5670638]}},{"type":"Feature","properties":{"name":"Zum Neuen Feldberg","type":"restaurant","web":"http://feldberg.fm/","cuisine":"regional","phone":"061 691 75 11 ‎"},"geometry":{"type":"Point","coordinates":[7.5907964,47.5664325]}},{"type":"Feature","properties":{"name":"RiiBistro","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5868666,47.5705632]}},{"type":"Feature","properties":{"name":"Don Pincho","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5841214,47.5644969]}},{"type":"Feature","properties":{"name":"PANE-CON-CARNE","adr":"Sternengasse, 18","type":"restaurant","phone":"+41 61 281 50 11"},"geometry":{"type":"Point","coordinates":[7.5926085,47.551765]}},{"type":"Feature","properties":{"name":"Vapiano","adr":"Sternengasse, 19","type":"restaurant","web":"www.vapiano.ch","cuisine":"italian","phone":"+41 61 272 72 22"},"geometry":{"type":"Point","coordinates":[7.5925927,47.55154]}},{"type":"Feature","properties":{"name":"Huhniversum","adr":"Henric Petri-Strasse, 24","type":"restaurant","phone":"+41 61 272 50 00"},"geometry":{"type":"Point","coordinates":[7.5932999,47.5514583]}},{"type":"Feature","properties":{"name":"Noohn","adr":"Henric Petri-Strasse, 12","type":"restaurant","phone":"+41 61 281 14 14"},"geometry":{"type":"Point","coordinates":[7.5922437,47.552086]}},{"type":"Feature","properties":{"name":"Rialto","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5834578,47.5498846]}},{"type":"Feature","properties":{"name":"Kornhaus","adr":"Kornhausgasse, 10","type":"restaurant","web":"http://www.kornhaus-basel.ch","cuisine":"regional"},"geometry":{"type":"Point","coordinates":[7.5832142,47.5564247]}},{"type":"Feature","properties":{"name":"Mensa Universität Basel","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5819867,47.560008]}},{"type":"Feature","properties":{"name":"Restaurant Filini","adr":"Steinentorstrasse, 25","type":"restaurant","web":"http://www.filinirestaurant.com/restaurant-basel","cuisine":"italian","phone":"+41 61 227 29 50","hours":["11:30-23:30"]},"geometry":{"type":"Point","coordinates":[7.5887692,47.5514156]}},{"type":"Feature","properties":{"name":"Zum Kuss","adr":"Elisabethenstrasse, 59","type":"restaurant","web":"http://www.zumkuss.ch/","cuisine":"regional"},"geometry":{"type":"Point","coordinates":[7.5901434,47.5499012]}},{"type":"Feature","properties":{"name":"Mandir","adr":"Schützenmattstrasse, 2","type":"restaurant","web":"http://www.hotel-spalenbrunnen.ch/Restaurant-mandir_5_de.html","cuisine":"indian"},"geometry":{"type":"Point","coordinates":[7.5826147,47.5573507]}},{"type":"Feature","properties":{"name":"Restaurant Pizzeria Dorenbach","adr":"Holeestrasse, 61","type":"restaurant","web":"http://www.restaurant-dorenbach.com/","cuisine":"pizza","phone":"+41 61 301 2631"},"geometry":{"type":"Point","coordinates":[7.5716504,47.5448366]}},{"type":"Feature","properties":{"name":"Klingental","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5912762,47.5627057]}},{"type":"Feature","properties":{"name":"Hirscheneck","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5953008,47.5590161]}},{"type":"Feature","properties":{"name":"Restaurant zur Linde","adr":"Rheingasse, 45","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5931568,47.5593624]}},{"type":"Feature","properties":{"name":"Brauerei","adr":"Grenzacherstrasse, 90","type":"restaurant","web":"http://www.brauerei-basel.ch","phone":"+41 61 6924936"},"geometry":{"type":"Point","coordinates":[7.6011992,47.5587383]}},{"type":"Feature","properties":{"name":"Royal Palace","adr":"Spalenring, 160","type":"restaurant","cuisine":"indian","hours":["Mo-Sa 10:30-14:00,17:00-23:30","Su 17:00-23:30"]},"geometry":{"type":"Point","coordinates":[7.576166,47.5541247]}},{"type":"Feature","properties":{"name":"Zoo Restaurant","adr":"Bachlettenstrasse","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5777799,47.5477335]}},{"type":"Feature","properties":{"name":"Cafe Spillmann","type":"restaurant","cuisine":"regional"},"geometry":{"type":"Point","coordinates":[7.5887767,47.5594365]}},{"type":"Feature","properties":{"name":"Bodega Zum Strauss","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5887472,47.5547429]}},{"type":"Feature","properties":{"name":"Cantina Primo Piano","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.588369,47.5566038]}},{"type":"Feature","properties":{"name":"Borromäum (Kulturzentrum, Restaurant)","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5827294,47.5525523]}},{"type":"Feature","properties":{"name":"Hotel-Restaurant Resslirytti","adr":"Theodorsgraben, 42","type":"restaurant","web":"http://www.resslirytti.ch/","cuisine":"italian"},"geometry":{"type":"Point","coordinates":[7.5990762,47.5589346]}},{"type":"Feature","properties":{"name":"Kiosk","type":"restaurant","cuisine":"sandwich","phone":"+41 61 324 39 23"},"geometry":{"type":"Point","coordinates":[7.5877225,47.5713407]}},{"type":"Feature","properties":{"name":"Brötlibar","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5887661,47.5549114]}},{"type":"Feature","properties":{"name":"Efringerhof","type":"restaurant","phone":"+4161 692 11 75"},"geometry":{"type":"Point","coordinates":[7.5963892,47.5673371]}},{"type":"Feature","properties":{"name":"Steinbock","adr":"Centralbahnstrasse, 19","type":"restaurant","web":"http://www.restaurantsteinbock.ch","cuisine":"Swiss"},"geometry":{"type":"Point","coordinates":[7.5916641,47.5471935]}},{"type":"Feature","properties":{"name":"Pizzeria Centro","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5900301,47.5552409]}},{"type":"Feature","properties":{"name":"Kohlmanns","adr":"Barfüsserplatz, 14","type":"restaurant","web":"http://www.kohlmanns.ch","phone":"+41 61 2259393","hours":["Mo-Th,Su 11:30-00:30","Fr-Sa 11:30-01:00"]},"geometry":{"type":"Point","coordinates":[7.5892937,47.5543939]}},{"type":"Feature","properties":{"name":"St. Alban-Eck","adr":"St. Alban-Vorstadt, 60","type":"restaurant","cuisine":"regional, saisonal"},"geometry":{"type":"Point","coordinates":[7.5984961,47.5542573]}},{"type":"Feature","properties":{"name":"Restaurant Orange","adr":"Elsässerstrasse, 49","type":"restaurant","cuisine":"regional","phone":"+41 61 321 92 77"},"geometry":{"type":"Point","coordinates":[7.5795669,47.5689073]}},{"type":"Feature","properties":{"name":"Restaurant The New Point","adr":"Elsässerstrasse, 57","type":"restaurant","cuisine":"regional","phone":"+41 61 381 03 04"},"geometry":{"type":"Point","coordinates":[7.5791429,47.5693206]}},{"type":"Feature","properties":{"name":"Pizza Point","adr":"Elsässerstrasse, 14","type":"restaurant","cuisine":"pizza"},"geometry":{"type":"Point","coordinates":[7.5802135,47.5684781]}},{"type":"Feature","properties":{"name":"Restaurant FuTo","adr":"Hochstrasse, 51","type":"restaurant","web":"http://www.restaurant-futo.ch","cuisine":"chinese"},"geometry":{"type":"Point","coordinates":[7.5949117,47.5446816]}},{"type":"Feature","properties":{"name":"Sai Gon Moon","type":"restaurant","cuisine":"vietnamese"},"geometry":{"type":"Point","coordinates":[7.5748136,47.5568738]}},{"type":"Feature","properties":{"name":"Nordbahnhof","type":"restaurant","cuisine":"thai"},"geometry":{"type":"Point","coordinates":[7.5761162,47.566457]}},{"type":"Feature","properties":{"name":"Mamma Lucia","type":"restaurant","cuisine":"pizza"},"geometry":{"type":"Point","coordinates":[7.5739597,47.5701882]}},{"type":"Feature","properties":{"name":"Tapeo Tapas Bar La Terraza","adr":"Haltingerstrasse, 104","type":"restaurant","web":"http://www.tapeo.ch","cuisine":"spanish","phone":"0615430312","hours":["Tu-Su 17:00-23:30"]},"geometry":{"type":"Point","coordinates":[7.597422,47.566436]}},{"type":"Feature","properties":{"name":"Rössli","adr":"Brombacherstrasse, 30","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.596641,47.5700863]}},{"type":"Feature","properties":{"name":"Thai Café","adr":"Brombacherstrasse, 44","type":"restaurant","web":"http://www.thaicafe.ch/"},"geometry":{"type":"Point","coordinates":[7.5973694,47.5698504]}},{"type":"Feature","properties":{"name":"Cuor D'oro","adr":"Horburgstrasse, 74","type":"restaurant","web":"http://ristorante-italiano.ch/"},"geometry":{"type":"Point","coordinates":[7.594893,47.5705566]}},{"type":"Feature","properties":{"name":"Habesha","adr":"Markgräflerstrasse, 89","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.596197,47.5701487]}},{"type":"Feature","properties":{"name":"Bauernzunft","adr":"Rheingasse, 15","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5917922,47.5604591]}},{"type":"Feature","properties":{"name":"zum Wurzengraben","adr":"Riehenring, 69","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5988029,47.5637732]}},{"type":"Feature","properties":{"name":"soup suppenbar","type":"restaurant","cuisine":"Soups"},"geometry":{"type":"Point","coordinates":[7.5868476,47.5456862]}},{"type":"Feature","properties":{"name":"Salsicia piu'","adr":"Steinentorstrasse, 26","type":"restaurant","cuisine":"italian"},"geometry":{"type":"Point","coordinates":[7.5884417,47.5516282]}},{"type":"Feature","properties":{"name":"Casanova","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5833412,47.5570844]}},{"type":"Feature","properties":{"name":"Alte Post","adr":"Centralbahnstrasse, 21","type":"restaurant","cuisine":"regional, pizza","hours":["Mo-Fr 10:00-24:00","Sa,Su 10:00-23:00"]},"geometry":{"type":"Point","coordinates":[7.5919392,47.5470923]}},{"type":"Feature","properties":{"name":"Suppenstube zur Krähe","type":"restaurant","web":"http://spalenvorstadt.ch/Geschaefte/Suppenstube%20zur%20Kraehe/suppenstube.php"},"geometry":{"type":"Point","coordinates":[7.5831342,47.5571667]}},{"type":"Feature","properties":{"name":"Grace","adr":"Elisabethenstrasse, 33","type":"restaurant","hours":["Mo-Th 12:00-14:00,17:00-24:00","Fr 12:00-14:00,17:00-02:00","Sa 17:00-02:00"]},"geometry":{"type":"Point","coordinates":[7.5911528,47.551308]}},{"type":"Feature","properties":{"name":"800° Premium Steakhouse","type":"restaurant","web":"http://www.800grad.ch/","cuisine":"steak house"},"geometry":{"type":"Point","coordinates":[7.5976173,47.5659455]}},{"type":"Feature","properties":{"name":"La Fourchette","adr":"Klybeckstrasse, 122","type":"restaurant","web":"http://www.lafourchettebasel.com/","cuisine":"french","phone":"+ 41 61 691 28 28"},"geometry":{"type":"Point","coordinates":[7.5905993,47.5680679]}},{"type":"Feature","properties":{"name":"Küsne","adr":"Claragraben, 76","type":"restaurant","cuisine":"kebab"},"geometry":{"type":"Point","coordinates":[7.5945777,47.5621966]}},{"type":"Feature","properties":{"name":"1777","adr":"Im Schmiedenhof, 10","type":"restaurant","web":"www.1777.ch","phone":"+41612617777"},"geometry":{"type":"Point","coordinates":[7.5878307,47.5570266]}},{"type":"Feature","properties":{"name":"Union Linder","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5890387,47.5528079]}},{"type":"Feature","properties":{"name":"Caveau Bâle","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5880282,47.5567453]}},{"type":"Feature","properties":{"name":"Le S","type":"restaurant","web":"http://www.senevita.ch/de/betriebe/erlenmatt/gastronomie.php"},"geometry":{"type":"Point","coordinates":[7.5993385,47.5690986]}},{"type":"Feature","properties":{"name":"Domino's Pizza","type":"restaurant","web":"https://www.dominos.ch/","cuisine":"pizza"},"geometry":{"type":"Point","coordinates":[7.574275,47.5615711]}},{"type":"Feature","properties":{"name":"Hitzberger","type":"restaurant","web":"http://www.hitzberger.com/"},"geometry":{"type":"Point","coordinates":[7.5954689,47.5518915]}},{"type":"Feature","properties":{"name":"Restaurant Aeschenplatz","type":"restaurant","web":"http://www.aeschenplatz.ch/","hours":["Mo-Fr 08:30-24:00"]},"geometry":{"type":"Point","coordinates":[7.5959659,47.5512758]}},{"type":"Feature","properties":{"name":"Jeffery’s Thai Restaurant","type":"restaurant","web":"http://www.jefferys.ch/"},"geometry":{"type":"Point","coordinates":[7.5983857,47.5642735]}},{"type":"Feature","properties":{"name":"namamen Japanese Ramenbar Messe","type":"restaurant","web":"http://www.namamen.ch/","cuisine":"japanese"},"geometry":{"type":"Point","coordinates":[7.5996043,47.5637483]}},{"type":"Feature","properties":{"name":"Käfer Stube","type":"restaurant","web":"http://www.kaefer-schweiz.ch/index.php?id=stube"},"geometry":{"type":"Point","coordinates":[7.5999219,47.5634011]}},{"type":"Feature","properties":{"name":"Grill25","type":"restaurant","web":"http://www.swissotel.com/hotels/basel/dining/restaurant-grill25/"},"geometry":{"type":"Point","coordinates":[7.5993884,47.5630151]}},{"type":"Feature","properties":{"name":"zem alte Schluuch","adr":"Greifengasse, 6","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5915059,47.5608684]}},{"type":"Feature","properties":{"name":"Trattoria Bar Da Sonny","adr":"Vogesenstrasse, 96","type":"restaurant","cuisine":"italian"},"geometry":{"type":"Point","coordinates":[7.5763815,47.5680565]}},{"type":"Feature","properties":{"name":"Latini","adr":"Falknerstrasse, 31","type":"restaurant","web":"http://www.bindella.ch/de/latini.html","cuisine":"italian","phone":"+41 61 261 34 43","hours":["11:00–01:00"]},"geometry":{"type":"Point","coordinates":[7.5893591,47.5555484]}},{"type":"Feature","properties":{"name":"Valentino's Place","adr":"Kandererstrasse, 35","type":"restaurant","cuisine":"burger","hours":["Di-Do 17.00-2400","Fr/Sa 17.00-0100","So 1100-1600"]},"geometry":{"type":"Point","coordinates":[7.590881,47.5658489]}},{"type":"Feature","properties":{"name":"Museumsbistro","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5908431,47.5571002]}},{"type":"Feature","properties":{"name":"Milchhüsli","adr":"Missionsstrasse, 61","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.574944,47.561151]}},{"type":"Feature","properties":{"name":"Lily's","adr":"Rebgasse, 1","type":"restaurant","cuisine":"asian","phone":"0616831111"},"geometry":{"type":"Point","coordinates":[7.5940058,47.5612047]}},{"type":"Feature","properties":{"name":"Zur Mägd","adr":"St. Johanns-Vorstadt, 29","type":"restaurant","web":"http://www.zurmaegd.ch","cuisine":"italian","phone":"+41612815010","hours":["Tu-Sa 11:00-00:00"]},"geometry":{"type":"Point","coordinates":[7.5841218,47.5638092]}},{"type":"Feature","properties":{"name":"New Bombay am Rhein","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5861934,47.5616693]}},{"type":"Feature","properties":{"name":"Bacio","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5835395,47.564904]}},{"type":"Feature","properties":{"name":"jay's","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5846079,47.5631379]}},{"type":"Feature","properties":{"name":"Zum Isaak","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5912584,47.5564191]}},{"type":"Feature","properties":{"name":"Der vierte König","adr":"Blumenrain, 20","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5871271,47.5610761]}},{"type":"Feature","properties":{"name":"LoLa","adr":"Lothringerstrasse, 63","type":"restaurant","web":"http://www.quartiertreffpunktebasel.ch/quartier-treffpunkte-basel/quartiertreffpunkt-lola/","phone":"061 321 48 28"},"geometry":{"type":"Point","coordinates":[7.5771542,47.5684242]}},{"type":"Feature","properties":{"name":"Il Gusto","adr":"Margarethenstrasse","type":"restaurant","cuisine":"italian"},"geometry":{"type":"Point","coordinates":[7.5830829,47.5459332]}},{"type":"Feature","properties":{"name":"Bajwa-Palace","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5911355,47.5508838]}},{"type":"Feature","properties":{"name":"Coop Restaurant","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.58764,47.557592]}},{"type":"Feature","properties":{"name":"Restaurant Schnabel","adr":"Trillengässlein, 2","type":"restaurant","web":"www.restaurant-schnabel.ch","cuisine":"regional","phone":"061 261 21 21"},"geometry":{"type":"Point","coordinates":[7.586761,47.5568363]}},{"type":"Feature","properties":{"name":"Zolli Restaurant","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.57775975,47.54779875]}},{"type":"Feature","properties":{"name":"Sternenhof","adr":"Sternengasse, 27","type":"restaurant","cuisine":"international"},"geometry":{"type":"Point","coordinates":[7.5922184,47.5511632]}},{"type":"Feature","properties":{"name":"Zum schiefen Eck","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5930317,47.561645]}},{"type":"Feature","properties":{"name":"Restaurant Pavillon im Park","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5745438499999995,47.5524481]}},{"type":"Feature","properties":{"name":"Gare du Nord","adr":"Schwarzwaldallee, 200","type":"restaurant","web":"http://www.garedunord.ch"},"geometry":{"type":"Point","coordinates":[7.6064557,47.56793675]}},{"type":"Feature","properties":{"name":"Les Garecons Basel","adr":"Schwarzwaldallee, 200","type":"restaurant","web":"www.lesgarecons.ch","cuisine":"regional","phone":"+41 61 681 84 88","hours":["Mo-Sa 09:00-24:00","Su 10:00-23:00"]},"geometry":{"type":"Point","coordinates":[7.6066372,47.567729]}},{"type":"Feature","properties":{"name":"Buffet","adr":"Vogesenplatz, 1","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5727053,47.57015935]}},{"type":"Feature","properties":{"name":"Brasserie","type":"restaurant"},"geometry":{"type":"Point","coordinates":[7.5888278,47.547670600000004]}}]
},{}],22:[function(require,module,exports){
var places = require('./places.json')
var tourism = require('./tourism.json')
var eat = require('./eat.json')
var drink = require('./drink.json')

exports.places = function(n, callback) {
	console.log('gets place: "' + n + '"')
	setTimeout(function() {
		callback(null, places)
	},2000)
}

exports.overpass = function(pt, type, callback) {
	console.log('gets overpass point: "' + pt.toString() + '" and type: "' + type + '"' )
	if(type === 'tourism') { setTimeout(function() { callback(null, tourism) },2000) }
	if(type === 'eat') { setTimeout(function() { callback(null, eat) },2000) }
	if(type === 'drink') { setTimeout(function() {callback(null, drink) },2000) }
}

},{"./drink.json":20,"./eat.json":21,"./places.json":23,"./tourism.json":24}],23:[function(require,module,exports){
module.exports=﻿[{"name":"Basel, Basel-City, Switzerland","coords":[7.5878261,47.5581077]},{"name":"Basel, Matersdorf, Qiryat Moshe, Jerusalem, Jerusalem District, 91130, Israel","coords":[35.1926209,31.7840132]},{"name":"Basel, Tel Aviv, Kochav HaTsafon, Tel Aviv-Yafo, Tel Aviv District, 60000, Israel","coords":[34.7792405,32.0899018]},{"name":"Basel, Reshef, Herzliya Pituach, Herzliya, Tel Aviv District, 46733, Israel","coords":[34.8078859,32.1782418]},{"name":"Basel, Reshef, Herzliya Pituach, Herzliya, Tel Aviv District, 46733, Israel","coords":[34.8129921,32.1773129]},{"name":"Basel, שכונה א, Alef, Be'er Sheva, South District, 84102, Israel","coords":[34.7876646,31.2505537]},{"name":"Basel, Agrobank, שכונת עם, Holon, Tel Aviv District, 5832337, Israel","coords":[34.7727589,32.0239677]},{"name":"Basel, Bat Yam, Shikun Vatikim, Bat Yam, Tel Aviv District, 59315, Israel","coords":[34.7399885,32.0162758]},{"name":"Basel, Barrio San José, Arica, Provincia de Arica, Arica and Parinacota Region, 1020759, Chile","coords":[-70.2957547,-18.475777]},{"name":"Basel, Valle La Dehesa, Lo Barnechea, Provincia de Santiago, Región Metropolitana de Santiago, 7700651, Chile","coords":[-70.5135511,-33.3267786]}]
},{}],24:[function(require,module,exports){
module.exports=﻿[{"type":"Feature","properties":{"name":"Bank für Internationalen Zahlungsausgleich (BIZ)","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5917653,47.548069]}},{"type":"Feature","properties":{"name":"Petersplatz","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5835959,47.5590699]}},{"type":"Feature","properties":{"name":"Pfalz","type":"viewpoint"},"geometry":{"type":"Point","coordinates":[7.5928444,47.5568427]}},{"type":"Feature","properties":{"name":"Museum der Kulturen","adr":"Münsterplatz, 20","web":"http://www.mkb.ch","type":"museum"},"geometry":{"type":"Point","coordinates":[7.5908379,47.5571155]}},{"type":"Feature","properties":{"name":"Karikatur & Cartoon Museum Basel","adr":"St.-Alban-Vorstadt, 28","web":"http://www.cartoonmuseum.ch","type":"museum"},"geometry":{"type":"Point","coordinates":[7.5963855,47.5545033]}},{"type":"Feature","properties":{"name":"Kunsthalle Basel","adr":"Steinenberg, 7","web":"http://www.kunsthallebasel.ch","type":"museum"},"geometry":{"type":"Point","coordinates":[7.5912184,47.5536354]}},{"type":"Feature","properties":{"name":"Schweizerisches Architekturmuseum","adr":"Steinenberg, 7","web":"http://www.sam-basel.org","type":"museum"},"geometry":{"type":"Point","coordinates":[7.5910322,47.5537658]}},{"type":"Feature","properties":{"name":"Pharmazie-Historisches Museum","adr":"Totengässlein, 3","web":"http://www.pharmaziemuseum.ch","type":"museum"},"geometry":{"type":"Point","coordinates":[7.5863511,47.5585912]}},{"type":"Feature","properties":{"name":"Spielzeug Welten Museum Basel","adr":"Steinenvorstadt, 1","web":"http://www.spielzeug-welten-museum-basel.ch/","type":"museum"},"geometry":{"type":"Point","coordinates":[7.5891089,47.5540232]}},{"type":"Feature","properties":{"name":"Jüdisches Museum der Schweiz","adr":"Kornhausgasse, 8","web":"http://www.juedisches-museum.ch","type":"museum"},"geometry":{"type":"Point","coordinates":[7.5833469,47.556517]}},{"type":"Feature","properties":{"name":"Schweizerisches Feuerwehrmuseum","adr":"Spalenvorstadt, 11","web":"http://www.rettung.bs.ch/feuerwehr/feuerwehr-hautnah/schweizerisches-feuerwehrmuseum-basel-stadt.html","type":"museum"},"geometry":{"type":"Point","coordinates":[7.582315,47.5568315]}},{"type":"Feature","properties":{"name":"Skulpturhalle","adr":"Mittelere Strasse, 17","web":"http://www.skulpturhalle.ch","type":"museum"},"geometry":{"type":"Point","coordinates":[7.5792608,47.5603665]}},{"type":"Feature","properties":{"name":"Anatomisches Museum","adr":"Pestalozzistrasse, 20","web":"https://anatomie.unibas.ch/museum/","type":"museum"},"geometry":{"type":"Point","coordinates":[7.5795758,47.5648908]}},{"type":"Feature","properties":{"name":"Antikenmuseum Basel und Sammlung Ludwig","adr":"St.-Alban-Graben, 5","web":"http://www.antikenmuseumbasel.ch","type":"museum"},"geometry":{"type":"Point","coordinates":[7.593141,47.5543563]}},{"type":"Feature","properties":{"name":"Basel Badischer Bahnhof","type":"information"},"geometry":{"type":"Point","coordinates":[7.6070751,47.5673479]}},{"type":"Feature","properties":{"name":"pos5","type":"artwork"},"geometry":{"type":"Point","coordinates":[7.5931729,47.558868]}},{"type":"Feature","properties":{"name":"Beyli Zahntechnik","type":"artwork"},"geometry":{"type":"Point","coordinates":[7.5848036,47.5466559]}},{"type":"Feature","properties":{"name":"Basel","type":"information"},"geometry":{"type":"Point","coordinates":[7.6071227,47.5669816]}},{"type":"Feature","properties":{"name":"Musikmuseum","adr":"Im Lohnhof, 9","web":"http://www.hmb.ch/de/ueber-das-museum/vier-ausstellungshaeuser/Museumfuermusik","type":"museum"},"geometry":{"type":"Point","coordinates":[7.5881207,47.5548126]}},{"type":"Feature","properties":{"name":"Dampfbahn Basel","type":"theme_park"},"geometry":{"type":"Point","coordinates":[7.5677241,47.5710498]}},{"type":"Feature","properties":{"name":"Sommer-Casino","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5985617,47.5474509]}},{"type":"Feature","properties":{"name":"Zoo Basel - Haupteingang","type":"zoo","hours":["Jan, Feb, Nov, Dec: 08:00-17:30","Mar, Apr, Sep, Oct: 08:00-18:00","May-Aug: 08:00-18:30"]},"geometry":{"type":"Point","coordinates":[7.5823698,47.548946]}},{"type":"Feature","properties":{"name":"Flohmarkt, Herbstmesse, Weihnachtsmarkt","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5896873,47.5546926]}},{"type":"Feature","properties":{"name":"Ausstellungsraum Klingental","type":"museum"},"geometry":{"type":"Point","coordinates":[7.5900022,47.5625176]}},{"type":"Feature","properties":{"name":"Historisches Museum: Musikmuseum","type":"museum"},"geometry":{"type":"Point","coordinates":[7.5883889,47.5550919]}},{"type":"Feature","properties":{"name":"Museum Kleines Klingental","type":"museum"},"geometry":{"type":"Point","coordinates":[7.5896648,47.5620071]}},{"type":"Feature","properties":{"name":"Helvetia auf Reisen","type":"artwork"},"geometry":{"type":"Point","coordinates":[7.5904879,47.5608642]}},{"type":"Feature","properties":{"name":"Tourist Information Bahnhof SBB","adr":"Centralbahnstrasse, 10","web":"https://www.basel.com/","type":"information","phone":"+41 61 268 68 68"},"geometry":{"type":"Point","coordinates":[7.5891865,47.5478387]}},{"type":"Feature","properties":{"name":"Wanderwegweiser","type":"information"},"geometry":{"type":"Point","coordinates":[7.5881252,47.5599453]}},{"type":"Feature","properties":{"name":"Hoosesagg Museum","web":"http://www.hoosesaggmuseum.ch/","type":"museum"},"geometry":{"type":"Point","coordinates":[7.5858226,47.557967]}},{"type":"Feature","properties":{"name":"Zoologischer Garten Basel","type":"zoo"},"geometry":{"type":"Point","coordinates":[7.5791841,47.546868]}},{"type":"Feature","properties":{"name":"Afrikahaus","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.58124005,47.54927405]}},{"type":"Feature","properties":{"name":"Vogelhaus","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.57860155,47.54822365]}},{"type":"Feature","properties":{"name":"Australis","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.58175345,47.5481745]}},{"type":"Feature","properties":{"name":"Nashornhaus","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.57724985,47.5452715]}},{"type":"Feature","properties":{"name":"Lorihaus","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5765581,47.544995799999995]}},{"type":"Feature","properties":{"name":"Antilopenhaus","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.57698425,47.5459283]}},{"type":"Feature","properties":{"name":"Etoscha-Haus","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5772531,47.5466631]}},{"type":"Feature","properties":{"name":"Gamgoashaus","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.57601895,47.5461633]}},{"type":"Feature","properties":{"name":"Kinderzoo","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5793782499999995,47.5467212]}},{"type":"Feature","properties":{"name":"Zebra + Strauss","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5809012,47.5490339]}},{"type":"Feature","properties":{"name":"Kängurus","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5814958,47.548253700000004]}},{"type":"Feature","properties":{"name":"Pelikane","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5792459999999995,47.54772445]}},{"type":"Feature","properties":{"name":"Enten","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.578752,47.54776445]}},{"type":"Feature","properties":{"name":"Kunstmuseum Basel | Gegenwart","type":"museum"},"geometry":{"type":"Point","coordinates":[7.60113345,47.5546072]}},{"type":"Feature","properties":{"name":"Papiermuseum","type":"museum"},"geometry":{"type":"Point","coordinates":[7.6034758,47.55466625]}},{"type":"Feature","properties":{"name":"Fasnachts-Brunnen","wiki":"https://de.wikipedia.org/wiki/Fasnachts-Brunnen","type":"artwork"},"geometry":{"type":"Point","coordinates":[7.59062355,47.553664749999996]}},{"type":"Feature","properties":{"name":"Museum für Wohnkultur","web":"http://www.hmb.ch/de/ueber-das-museum/vier-ausstellungshaeuser/Museumfuerwohnkultur","wiki":"https://de.wikipedia.org/wiki/Haus_zum_Kirschgarten","type":"museum","phone":"+41 61 205 86 00"},"geometry":{"type":"Point","coordinates":[7.591351550000001,47.552102950000005]}},{"type":"Feature","properties":{"name":"Bot. Garten der Universität","web":"https://botgarten.unibas.ch/","type":"museum"},"geometry":{"type":"Point","coordinates":[7.581776250000001,47.558842350000006]}},{"type":"Feature","properties":{"name":"Historisches Museum","adr":"Barfüsserplatz, 7","web":"http://www.hmb.ch","type":"museum"},"geometry":{"type":"Point","coordinates":[7.59048655,47.55448775]}},{"type":"Feature","properties":{"name":"Naturhistorisches Museum Basel","adr":"Augustinergasse, 2","web":"http://www.nmb.bs.ch","type":"museum"},"geometry":{"type":"Point","coordinates":[7.590217450000001,47.557595]}},{"type":"Feature","properties":{"name":"Galerie Carzaniga GmbH","adr":"Gemsberg, 8","web":"http://www.carzaniga.ch","type":"gallery","hours":["Mo-Fr 09:00-18:00","Sa 10:00-16:00"]},"geometry":{"type":"Point","coordinates":[7.5861924,47.55631965]}},{"type":"Feature","properties":{"name":"Malaienbär","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5812881,47.54871625]}},{"type":"Feature","properties":{"name":"Löwen","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.576098399999999,47.54647855]}},{"type":"Feature","properties":{"name":"Rotducker-Antilope","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.57770705,47.546786100000006]}},{"type":"Feature","properties":{"name":"Flusspferd","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.581452649999999,47.5491061]}},{"type":"Feature","properties":{"name":"Nashorn","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5774513500000005,47.545039450000004]}},{"type":"Feature","properties":{"name":"Schneeleopard","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5770816,47.54470185]}},{"type":"Feature","properties":{"name":"Bison","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5783380000000005,47.54631145]}},{"type":"Feature","properties":{"name":"Antilopen","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.57894805,47.5472366]}},{"type":"Feature","properties":{"name":"Gepard","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.57692705,47.5468623]}},{"type":"Feature","properties":{"name":"Brillenpinguine","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5766579499999995,47.544654550000004]}},{"type":"Feature","properties":{"name":"Wolf","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.57835515,47.546810300000004]}},{"type":"Feature","properties":{"name":"Flamingo","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.576787749999999,47.5463896]}},{"type":"Feature","properties":{"name":"Huftiere","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.581041,47.54783915]}},{"type":"Feature","properties":{"name":"Waldrapp","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.57791915,47.546241949999995]}},{"type":"Feature","properties":{"name":"Afri. Wildhund","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5761612,47.54692095]}},{"type":"Feature","properties":{"name":"Erdmänchen + Stachelschwein","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5773019,47.54649845]}},{"type":"Feature","properties":{"name":"Zebu","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.57972885,47.547215300000005]}},{"type":"Feature","properties":{"name":"Pony","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5800631,47.5475831]}},{"type":"Feature","properties":{"name":"Rentier","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.57855075,47.54653545]}},{"type":"Feature","properties":{"name":"Aguti - Nagetier","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5774275,47.546363850000006]}},{"type":"Feature","properties":{"name":"Lama","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5787282000000005,47.54668085]}},{"type":"Feature","properties":{"name":"Geissbock","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.577746149999999,47.544664749999995]}},{"type":"Feature","properties":{"name":"Schnee-Eulen","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5787153499999995,47.546966]}},{"type":"Feature","properties":{"name":"Minipig","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5801561500000005,47.54722195]}},{"type":"Feature","properties":{"name":"Eulen","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.57758945,47.54627355]}},{"type":"Feature","properties":{"name":"Mufflon - Wildschaf","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.577803299999999,47.5465765]}},{"type":"Feature","properties":{"name":"Wildschwein","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5781722,47.54598695]}},{"type":"Feature","properties":{"name":"Zwergflusspferd","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5768001,47.545085]}},{"type":"Feature","properties":{"name":"Pfauenziegen","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5804022,47.54740365]}},{"type":"Feature","properties":{"name":"Nutria","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.578809,47.54807035]}},{"type":"Feature","properties":{"name":"Huhn","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.57980175,47.54698655]}},{"type":"Feature","properties":{"name":"Schwan","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5779064,47.5472209]}},{"type":"Feature","properties":{"name":"Ibis + Reiher","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.57892865,47.54837655]}},{"type":"Feature","properties":{"name":"Zwergesel","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5807426499999995,47.54785605]}},{"type":"Feature","properties":{"name":"Heidschnucke","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5808494500000005,47.5480527]}},{"type":"Feature","properties":{"name":"Wildesel","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.581110150000001,47.54807995]}},{"type":"Feature","properties":{"name":"Aquarium","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5822098,47.54856445]}},{"type":"Feature","properties":{"name":"Pinguine","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5819295,47.54846045]}},{"type":"Feature","properties":{"name":"Kormoran","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5816745,47.5485286]}},{"type":"Feature","properties":{"name":"Vivarium","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.58218755,47.54846855]}},{"type":"Feature","properties":{"name":"Gorilla","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5804368,47.548467650000006]}},{"type":"Feature","properties":{"name":"Totenkopfäffchen","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.579416849999999,47.548105899999996]}},{"type":"Feature","properties":{"name":"Zwergotter","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.577512499999999,47.5449266]}},{"type":"Feature","properties":{"name":"Wollaffe","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5793238,47.548320849999996]}},{"type":"Feature","properties":{"name":"Okapi","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5773433,47.5459255]}},{"type":"Feature","properties":{"name":"Muntjak","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.57713335,47.54504075]}},{"type":"Feature","properties":{"name":"Nilkrokodile","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5757414,47.54620975]}},{"type":"Feature","properties":{"name":"Orang-Utan","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.580201300000001,47.548145500000004]}},{"type":"Feature","properties":{"name":"Kleines Kudu","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5772395,47.546141950000006]}},{"type":"Feature","properties":{"name":"Giraffe","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.577022449999999,47.54572775]}},{"type":"Feature","properties":{"name":"Schimpansen","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.579893350000001,47.5480891]}},{"type":"Feature","properties":{"name":"Zwergziege","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5806766,47.54762785]}},{"type":"Feature","properties":{"name":"Geissen","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5799033,47.5471371]}},{"type":"Feature","properties":{"name":"Affenhaus","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.57967215,47.5483353]}},{"type":"Feature","properties":{"name":"Seelöwen","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5778681,47.545917149999994]}},{"type":"Feature","properties":{"name":"Hornrabe","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.58133105,47.547978400000005]}},{"type":"Feature","properties":{"name":"Intersection","type":"artwork"},"geometry":{"type":"Point","coordinates":[7.59021385,47.5533758]}},{"type":"Feature","properties":{"name":"Sportmuseum Schweiz","adr":"Reinacherstrasse, 1-3","web":"http://www.sportmuseum.ch","type":"museum"},"geometry":{"type":"Point","coordinates":[7.5779321,47.5599123]}},{"type":"Feature","properties":{"name":"Javaneraffe","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5773387,47.54469465]}},{"type":"Feature","properties":{"name":"Kunstmuseum Basel | Neubau","type":"museum"},"geometry":{"type":"Point","coordinates":[7.5951085,47.554463049999995]}},{"type":"Feature","properties":{"name":"Kongresszentrum / Halle 4","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.599107399999999,47.56261535]}},{"type":"Feature","properties":{"name":"Elefantenhaus","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5766447,47.5474059]}},{"type":"Feature","properties":{"name":"Katta","type":"attraction"},"geometry":{"type":"Point","coordinates":[7.5792344499999995,47.54819355]}},{"type":"Feature","properties":{"name":"DB Information","type":"information"},"geometry":{"type":"Point","coordinates":[7.607193199999999,47.56740165]}},{"type":"Feature","properties":{"name":"Tourist- & Hotel information Basel","type":"information"},"geometry":{"type":"Point","coordinates":[7.5891873499999996,47.5478329]}},{"type":"Feature","properties":{"name":"SBB Reisecentrum","type":"information"},"geometry":{"type":"Point","coordinates":[7.5900254,47.5472738]}},{"type":"Feature","properties":{"name":"Spalentor","adr":"Spalenvorstadt, 46","type":"attraction","hist":"Historic city gate"},"geometry":{"type":"Point","coordinates":[7.5813941,47.55795745]}},{"type":"Feature","properties":{"name":"Kunstmuseum Basel | Hauptbau","adr":"St. Alban-Graben, 16","web":"http://www.kunstmuseumbasel.ch","type":"museum","phone":"+41 61 206 62 62","hours":["Tu-Su 10:00-18:0"]},"geometry":{"type":"Point","coordinates":[7.5942439,47.5539061]}}]
},{}],25:[function(require,module,exports){
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



},{"./lib/config":13,"./lib/events":15,"events":1}]},{},[25]);
