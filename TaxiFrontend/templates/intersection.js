

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
		    __p.push('<div class="hoverbox" style="margin-left: 69px; top: 10px; margin-top:10px;"><center>At intersection: '+obj.roadname+'<br/>Click for pickup/dropoff time series.</center></div>');
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

var oldmarker = false;

function clickcontent(d) {
    //
    //console.log("making segment query: "+JSON.stringify(d));
    //fire highlight event:
    jsonarraybyindex[d.index]();
    qindex = d.index;
    
}

function eraseAndAddMarker(d) {
    //console.log("call to erase and add marker:"+JSON.stringify(d));
    if (oldmarker != false) {
	map.removeLayer(oldmarker);
	oldmarker = false;
    }
    var marker = L.circle([d.lat, d.lon],50, { color: '#f00', fillColor: '#f03',
					       fillOpacity: 0.5})
    marker.addTo(map);
    oldmarker = marker;
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

	//console.log('button clicked with name'+name);
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
    //console.log("in callback for showPositionWG"+JSON.stringify(position));
    if (wgallowposupdate == 1) {
	setMapCenter(position.coords.latitude, position.coords.longitude, null);
	wgallowposupdate = 0;
	unanimateWG("#getlocationicon",['fa-spin','fa-spinner'],['fa-crosshairs']);
    } else { console.log("in callback for showpositionWG redundant! not updating!"); }
}

var permithourchange = 0; //only allow change of hour once per call

var hourset = "00";

function setMapCenter(lat, lon, z) {
    //console.log("set map center fired"+lat+" "+lon);
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
    //console.log("qsobj "+JSON.stringify(qsobj));
    var z = parseInt(qsobj['z']);
    var queryindex = parseInt(qsobj['qindex']);
    if (isNaN(queryindex)) {
	qindex=-2;}
    else {
	qindex=queryindex;
	//clickcontent({index:qindex});
	
    }
    
    //set query time fields here to current date and time
    var curdate = new Date();
    
    map = new L.Map('map', {center: [lat, lon], zoom:zoom, minZoom: 11,
			    maxZoom: 17});
    
    oldlayer.addTo(map);
    cinteraction = wax.leaf.interaction(map,tilejson);
    
    makecharts();

    setTimeout( function () {
    $.ajax({
	dataType: "json",
	url: "/interapi",
	data: {k:10000},
	success: function( json ) {
	    //console.log("received json!" + JSON.stringify(json));
            jsondata = json;

	    //ADD JSON TABLE HANDLING HERE
	    var options = {
		source: json.record,
		rowClass: "classy",
		callback: function(){
		}
	    };
	    
	    ///////////////////////////////
	    // Test on a pre-existing table
	    $("#dataTable").jsonTable({
		head : ['Road Name','Pickup Wait<br/>(mins)','Avg. Dropoff<br/>Interval (mins)','Dropoff<br/>Percentage','Rank'],
		json : ['roadname','pph','dph','doexcess','rank']
	    });
            $("#dataTable").jsonTableUpdate(options);
            $("#dataTable").tablesorter();



            for (i = 0 ; i < json.record.length; i++) {
		var markerid = "#rowgetter"+(i+1);
		var markerobjid = "";
		
		var tmphighlightfn = (function (markerid,markerclass,idx) {
		    return function() {
			//console.log('querying marker'+JSON.stringify(jsondata.record[idx]));
			eraseAndAddMarker({lat: jsondata.record[idx].lat_txt, lon: jsondata.record[idx].lon_txt});
			qindex = jsondata.record[idx].index;
			updateURL();		    
			var highlightl = document.getElementsByClassName('highlightmarker');
			//console.log('highlightl size'+highlightl.length);
			for (j=0; j<highlightl.length; j++) {
			    highlightl[j].classList.remove('highlightmarker');
			}
			//$('body').scrollTo(markerid,2000);
			var highlightl = document.getElementsByClassName('rowhighlight');
			for (j=0; j<highlightl.length; j++) {
			    highlightl[j].classList.remove('rowhighlight');
			}
			$(markerid)[0].parentNode.parentNode.classList.add('rowhighlight');
			//add marker at location

			
			
			//update the chart
			$.ajax({
	                    dataType: "json",
	                    url: "/interoneapi",
          	            data: {qi:qindex},
	                    success: function( json ) {
				//console.log("received json from interoneapi!" + JSON.stringify(json));
				makechartswithdata(json.record,[
				    {"name":"dots","axis":0,"description":"Avg. Dropoff Interval (mins)"},
				    {"name":"puts","axis":0,"description":"Pickup Wait (mins)"}
				]);
				
			    }
			});
			
			
			//update the map
			setMapCenter(json.record[idx].lat_txt,json.record[idx].lon_txt,max(14,zoom));				   
			return false; } })(markerid,markerobjid,i);
		//		$(markerid)[0].onclick=tmphighlightfn;
		jsonarraybyindex[json.record[i].index] = tmphighlightfn;//json.record[i];
		
		$(markerid).parent().parent().each(function() { this.onclick=tmphighlightfn; });

		//if (i == 0) { //auto fire on this one
		//    tmphighlightfn();
		//};
		
	    }

	    if (qindex >= 0) {
		//alert("should query!");
		setTimeout(function () { jsonarraybyindex[qindex](); },6000);
	    }
	    
	}
    });

    },1000);
    
    
}//end of onceonload

function updateURL(v) {
    history.pushState('page', 'caption', '/intersection?qindex='+qindex);
}

//results drawer code
var drawermode = 0; //0 at top, 1 at bottom 
var queryexecdone = 0;
var qindex = -1;
var qlat = 0;
var qlon = 0;
var lat = 40.8;
var lon = -73.9;
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

var jsondata = false;
var jsonsortstatus = false;
var jsonarraybyindex = new Array();


