

// Populate map layer.
var markerl = Array();
var tilejson = {
    tilejson: '1.0.0',
    scheme: 'tms',
    tiles: ['http://{{ servername }}:{{ mapserverport }}/query4f/{z}/{x}/{y}.png'],
    grids: ['/static/tiles/query4/{z}/{x}/{y}.grid.json?'],
    formatter: //function(options, data) { alert('call in formatter: '+JSON.stringify(data)); return data; }
    function(o, d) {

	return {
	    teaser: function anonymous(obj) {

		// Open Webkit console to view
		//console.log(arguments);

		var __p = [],
		    print = function(){
			__p.push.apply(__p,arguments);
		    };
		with (obj||{}) {
		    // add content and hoverbox
		    __p.push('<div class="hoverbox" style="margin-left: 69px; top: 10px; margin-top:10px;">'+ JSON.stringify(obj) + '</div>');
		};
		return __p.join('');
	    },
	    full: function anonymous(obj) {
		var __p = [],
		    print = function(){
			__p.push.apply(__p,arguments);
		    };
		with (obj||{}) {
		    __p.push('');
		    //call function on click
		    clickcontent(obj);
		};
		return __p.join('');
	    },
	    location: function anonymous(obj) {
		var __p = [],
		    print = function(){
			__p.push.apply(__p,arguments);
		    };
		with (obj||{}) {
		    __p.push('');
		};
		return __p.join('');
	    }
	}[o.format](d);
    }
};

var markerl = [];

function clickcontent(d) {
    //
    console.log("making segment query: "+JSON.stringify(d));


    eraseAndAddMarker(d);
    //fire highlight event:
    jsonarraybyindex[d.index]();
    
}

function eraseAndAddMarker(d) {

    for (i=0; i<markerl.length; i++) {
	console.log('removing an old marker');
	map.removeLayer(markerl[i]);
    }
    
    markerl = [];
    var marker = L.circle([d.lat, d.lon],50, { color: '#f00', fillColor: '#f03',
					        fillOpacity: 0.5})
    marker.addTo(map);
    markerl[markerl.length] = marker;

}




//Jquery plugin for query string handling
(function($) {
    $.QueryString = (function(a) {
	if (a == "") return {};
	var b = {};
	for (var i = 0; i < a.length; ++i)
	{
	    var p=a[i].split('=');
	    if (p.length != 2) continue;
	    b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
	}
	return b;
    })(window.location.search.substr(1).split('&'))
})(jQuery);

var oldlayer = new wax.leaf.connector(tilejson);
var map = false;
var cinteraction = false;

// Populate map menu.
var layers = document.getElementById('menu-ui');

function addLayer(layer, name, zIndex) {
    layer
	.setZIndex(zIndex)
	.addTo(map);

    // Create a simple layer switcher that
    // toggles layers on and off.
    var link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.innerHTML = name;

    link.onclick = function(e) {
	e.preventDefault();
	e.stopPropagation();

	if (map.hasLayer(layer)) {
	    map.removeLayer(layer);
	    this.className = '';
	} else {
	    map.addLayer(layer);
	    this.className = 'active';
	}
    };

    layers.appendChild(link);
}

function addButton(name, func) {

    // Create a simple layer switcher that
    // toggles layers on and off.
    var link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.innerHTML = name;

    link.onclick = function(e) {
	e.preventDefault();
	e.stopPropagation();

	console.log('button clicked with name'+name);
	func();
    };
    layers.appendChild(link);
}

//addButton('Toggle<br/>Legend', function() { $('.wginfoi').toggle(500); });

function animateWG(id,arradd) {
    elem = $(id)[0]
    for (i=0; i<arradd.length; i++) {
	elem.classList.add(arradd[i]);
    }
}

function unanimateWG(id,arrrem,arradd) {
    elem = $(id)[0]
    for (i=0; i<arradd.length; i++) {
	elem.classList.add(arradd[i]);
    }
    for (i=0; i<arrrem.length; i++) {
	elem.classList.remove(arrrem[i]);
    }
}

var dopumode = 1; //0 is dropoff, 1 is pickup



////Query location directives////
var iboxlong = document.getElementById("long");
var iboxlat = document.getElementById("lat");
var iboxtime = document.getElementById("time");
function getLocationWG() {
    if (navigator.geolocation) {
	if (window.location.protocol == 'file:') {
	    showPositionWG({'coords':{'latitude':40.6,'longitude':-74.02}});
	}
	else {
	    wgallowposupdate = 1;
	    navigator.geolocation.getCurrentPosition(showPositionWG);
	}
    } else { 
	iboxlong.innerHTML = "Geolocation is not supported by this browser.";
    }
    
}

var wgallowposupdate = 0; //only allow position update once per call

function showPositionWG(position) {
    console.log("in callback for showPositionWG"+JSON.stringify(position));
    //iboxlat.value = position.coords.latitude;
    //iboxlong.value = position.coords.longitude;
    if (wgallowposupdate == 1) {
	setMapCenter(position.coords.latitude, position.coords.longitude, null);
	wgallowposupdate = 0;
	unanimateWG("#getlocationicon",['fa-spin','fa-spinner'],['fa-crosshairs']);
    } else { console.log("in callback for showpositionWG redundant! not updating!"); }
}

var permithourchange = 0; //only allow change of hour once per call

var hourset = "00";

function setMapCenter(lat, lon, z) {
    console.log("set map center fired"+lat+" "+lon);
    if ((lat - 40.7) > 0.9 || (lon + 74) > 0.9) {
	alert("Hello, it looks like you are not in NYC or your GPS location is not available. Please center the map at the desired location for a query.");
    }
    else {
	var zoomtarget = max(map.getZoom(),17);
	if (z == null) {
	    map.setView([lat,lon], zoomtarget);
	}
	else {
	    map.setView([lat,lon],z);
	}
    }
}

function min(a,b) {
    if (a<b) {return a;}
    else {return b;}
}
function max(a,b) {
    if (a>b) {return a;}
    else {return b;}
}

function updateOrientation() {
    $('#map').height(($(window).height()-8) /2 );
    $('#chartdiv').height(($(window).height()-8) /2);
}

function onceonload() { // What to do on page load:
    updateOrientation(); 
    
    var qsobj = $.QueryString;
    lat = parseFloat(qsobj['lat']);
    lon = parseFloat(qsobj['lon']);
    var z = parseInt(qsobj['z']);
    var m = parseInt(qsobj['m']);
    var q = parseInt(qsobj['q']);
    var e = parseInt(qsobj['e']);
    var querylat = parseFloat(qsobj['qlat']);
    var querylon = parseFloat(qsobj['qlon']);
    var indate = qsobj['date'];
    var intime = qsobj['time'];
    if (isNaN(lat)) { lat = 40.7; }
    if (isNaN(lon)) { lon = -74.0; }
    //if (lat != null) { setTimeout(function() { console.log('before kick'+map.getCenter()); console.log('kick!'+lat+' '+lon); setMapCenter(lat, lon, null); console.log('before kick'+map.getCenter()); },5000); }
    if (isNaN(z)) { zoom = 14; }
    if (isNaN(m)) { m = 1; }
    if ((false == isNaN(q)) && q == 1) { showInstructions(); }
    if (isNaN(e)) { e = 0; }
    if (isNaN(querylat)) {qlat=0;}
    if (isNaN(querylon)) {qlon=0;}
    
    //set query time fields here to current date and time
    var curdate = new Date();
    
    map = new L.Map('map', {center: [lat, lon], zoom:zoom, minZoom: 11,
			    maxZoom: 17});
    
    oldlayer.addTo(map);
    cinteraction = wax.leaf.interaction(map,tilejson);

}//end of onceonload

function updateURL(v) {
    latlng = map.getCenter();
    //showPositionWG({'coords':{'latitude':latlng.lat, 'longitude':latlng.lng}});
    var tinput = document.getElementById('wgtimeinput');	
    var dinput = document.getElementById('wgdateinput');	
    history.pushState('page', 'caption', '/intersection?lat='+latlng.lat+'&lon='+latlng.lng+'&z='+map.getZoom()+'&e='+queryexecdone+'&time='+tinput.value+'qlat='+qlat+'&qlon='+qlon);
    //console.log('moveend width height'+$(window).width()+' '+$(window).height());
}

//results drawer code
var drawermode = 0; //0 at top, 1 at bottom 
var queryexecdone = 0;
var qlat = 0;
var qlon = 0;
var lat = 0;
var lon = 0;
var zoom = 14;
//negative value means the object is above the fold (top of viewport),
//positive value is pixels from top
// Id is : #my-id
function distanceFromViewportTop(id) {
    var scrollTop     = $(window).scrollTop(),
	elementOffset = $(id).offset().top,
	distance      = (elementOffset - scrollTop);
    return distance;
}

