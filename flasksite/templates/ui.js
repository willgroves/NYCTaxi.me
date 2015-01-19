
//Init date and time pickers.
$('#wgtimeinput').datetimepicker({
    datepicker:false,
    format:'H:i',
    step:15,
    defaultSelect:true
});

$('#wgdateinput').datetimepicker({
    defaultSelect:true,
    timepicker:false,
    format:'Y/m/d',
    formatDate:'Y/m/d'
});

// Populate map layer.
var markerl = Array();
var tilejson = {
    tilejson: '1.0.0',
    scheme: 'tms',
    tiles: ['http://{{ servername }}:{{ mapserverport }}/mb_layer/{z}/{x}/{y}.png'],
    grids: ['http://{{ servername }}:{{ mapserverport }}/mb_layer/{z}/{x}/{y}.grid.json'],
    formatter: function(options, data) { return data.NAME }
};

var oldlayer = new wax.leaf.connector(tilejson);
var map = false;

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

//addButton('Clear Map',false);
addButton('<i class="fa fa-crosshairs"></i> Get Location',function () { getLocationWG(); });
addButton('<i class="fa fa-gears"></i> Query Location',function () { queryLocation(); });

//addButton('Dropoff Intensity',false);
//addButton('Pickup Intensity',false);


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
    iboxlat.value = Math.round(position.coords.latitude * 10000) / 10000;
    iboxlong.value = Math.round( position.coords.longitude * 10000) / 10000;
    if (wgallowposupdate == 1) {
	setMapCenter();
	wgallowposupdate = 0;
    } else { console.log("in callback for showpositionWG redundant! not updating!"); }
}

var permithourchange = 0; //only allow change of hour once per call

function setMapHour(hour2digit) {
    if (permithourchange > 0) {
	//add another layer for speculative testing purposes
	var tilejsonoverlay = {
	    tilejson: '1.0.0',
	    scheme: 'tms',
	    tiles: ['http://{{ servername }}:{{ mapserverport }}/composite_o'+hour2digit+'/{z}/{x}/{y}.png'],
	    grids: ['http://{{ servername }}:{{ mapserverport }}/composite_o'+hour2digit+'/{z}/{x}/{y}.grid.json'],
	    formatter: function(options, data) { return data.NAME }
	};

	var newlayer = new wax.leaf.connector(tilejsonoverlay);
	//map.addLayer(newlayer);
	newlayer.addTo(map);
	map.removeLayer(oldlayer);
	oldlayer = newlayer;
	permithourchange = 0;
    }
}

function queryLocation() { // query busyness and add info to map
    outputdiv = document.getElementById('divqueryoutput');
    //outputdiv.innerHTML = "Removing existing markers and querying...";
    
    //remove all existing markers
    console.log("removing all markers");
    while (markerl.length > 0) {
	newmarker = markerl.pop();
	map.removeLayer(newmarker);
    }
    console.log("all markers removed");
    
    latlng = map.getCenter();
    newmarker = L.marker([
	latlng.lat, latlng.lng
    ], {
	icon: L.divIcon({
	    // Specify a class name we can refer to in CSS.
	    className: 'count-icon',
	    // Define what HTML goes in each marker.
	    html: 'X',
	    // Set a markers width and height.
	    iconSize: [38, 38]
	    
	})
    })
    markerl.push(newmarker);
    newmarker.addTo(map);
    
    ttime = new Date();//document.getElementById('time').value);
    var yr = parseFloat($('#wgdateinput')[0].value.slice(0,4));
    ttime.setYear(yr);
    ttime.setMonth(parseFloat($('#wgdateinput')[0].value.slice(5,7))-1);
    ttime.setDate(parseFloat($('#wgdateinput')[0].value.slice(8,10)));
    ttime.setHours(parseFloat($('#wgtimeinput')[0].value.slice(0,2)));
    ttime.setMinutes(parseFloat($('#wgtimeinput')[0].value.slice(3,5)));
    console.log('querying time:'+ttime);
    $.ajax({
	dataType: "json",
	url: "/suggestapi",
	data: {'lat':latlng.lat,'lng':latlng.lng,'time':Math.round(ttime.getTime()/1000)},
	success: function( json ) {
	    console.log("received json!" + JSON.stringify(json));
	    outputdiv = document.getElementById('divqueryoutput');
	    //outputdiv.innerHTML = JSON.stringify(json);

	    newlocationl = json.nearestplaces;
	    
	    var tparent = document.getElementById('dataTable');
	    while(tparent.hasChildNodes())
	    {
		tparent.removeChild(tparent.firstChild);
	    }
	    
	    
	    //ADD JSON TABLE HANDLING HERE
	    var options = {
		source: json.nearestplaces,
		rowClass: "classy",
		callback: function(){
		}
	    };
	    
	    ///////////////////////////////
	    // Test on a pre-existing table
	    $("#dataTable").jsonTable({
		head : ['#','Walk<br/>(mins)','Direction','Avg. Wait<br/>(mins)','DO:PU ratio','Intersection'],
		json : ['rank','dst_walk','direction','pu_wait','do_pu_ratio','intersection_name']
	    });
	    $("#dataTable").jsonTableUpdate(options);
	    
	    i = 1;
	    while (newlocationl.length > 0) {
		newlocation = newlocationl.shift();
		markerlatlng = [newlocation.lat, newlocation.lon];
		console.log("adding marker at"+markerlatlng);
		newmarker = L.marker(markerlatlng, {
		    icon: L.divIcon({
			// Specify a class name we can refer to in CSS.
			className: 'count-icon',
			// Define what HTML goes in each marker.
			html: i,
			// Set a markers width and height.
			iconSize: [38, 38]
		    })
		})
		markerl.push(newmarker);
		newmarker.addTo(map);
		var line = Array();
		line.push(latlng);
		line.push(markerlatlng);
		var polyline_options = {
		    color: '#000',
		    opacity: 0.5,         // Stroke opacity
		    weight: 5         // Stroke weight
		};

		var polyline = L.polyline(line, polyline_options).addTo(map);
		markerl.push(polyline);
		i=i+1;
	    }
	    console.log("finished parsing nearby places");

	    permithourchange = 1;
	    setTimeout(function() { setMapHour(json.hour2digit); },1000);

	    setTimeout(function() { $('body').scrollTo('#dataTable',1000);
				    //window.scrollTo(0,document.body.scrollHeight);
				  },2500);

	}
    });


} //end of queryLocation

function setMapCenter() {
    console.log("set map center fired"+iboxlat.value+" "+iboxlong.value);
    if ((iboxlat.value - 40.7) > 0.9 || (iboxlong.value + 74) > 0.9) {
	alert("Hello, it looks like you are not in NYC or your GPS location is not available. Please center the map at the desired location for a query.");
    }
    else {
	var zoomtarget = max(map.getZoom(),17);
	map.setView([iboxlat.value, iboxlong.value], zoomtarget);
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
    $('#map').height($(window).height() - 80);
}

function onceonload() { // What to do on page load:
    updateOrientation(); 

    //set query time fields here to current date and time
    var curdate = new Date();
    var tinput = document.getElementById('wgtimeinput');
    tinput.value = ("0" + curdate.getHours()).slice(-2)+":"+("0" + curdate.getMinutes()).slice(-2);
    var dinput = document.getElementById('wgdateinput');
    dinput.value = curdate.getFullYear() + '/' + String.leftPad(curdate.getMonth() + 1, 2, '0') + '/' + String.leftPad(curdate.getDate(), 2, '0');;

    map = new L.Map('map', {center: [40.7, -74.0], zoom:13});
    oldlayer.addTo(map);


    setTimeout(function(){ 
	var date = new Date();
	currentHours = date.getHours();
	if (currentHours == 2) { currentHours = 3 };
	if (currentHours == 4) { currentHours = 3 };
	if (currentHours == 5) { currentHours = 3 };
	if (currentHours == 6) { currentHours = 3 };
	if (currentHours == 9) { currentHours = 10 };
	if (currentHours == 11) { currentHours = 12 };
	currentHours = ("0" + currentHours).slice(-2);
	permithourchange = 1;
	setMapHour(currentHours);
    }, 7000);

    map.addEventListener('moveend',function (v) {
	latlng = map.getCenter();
	showPositionWG({'coords':{'latitude':latlng.lat, 'longitude':latlng.lng}});
    });


}//end of onceonload

