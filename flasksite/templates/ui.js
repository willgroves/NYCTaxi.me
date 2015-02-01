
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
    format:'Y-m-d',
    formatDate:'Y-m-d'
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

//addButton('Clear Map',false);

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


function getlocbuttonfn() { animateWG("#getlocationicon",['fa-spin','fa-spinner']); getLocationWG(); }
function querylocationbuttonfn() { animateWG("#querylocationicon",['fa-spin','fa-spinner']); queryLocation(); }
addButton('<i class="fa fa-crosshairs" id="getlocationicon"></i> Get Location',getlocbuttonfn);
addButton('<i class="fa fa-gears" id="querylocationicon"></i> Query Location',querylocationbuttonfn);
addButton('<i class="fa fa-question-circle"></i> Show Help',function () { showInstructions(); });
//addButton('----',function () {});
function dochange() { if (dopumode == 1) {
    dopumode = 0;
    unanimateWG("#dropcheckicon",['fa-square'],['fa-check-square']);
    unanimateWG("#pickcheckicon",['fa-check-square'],['fa-square']);
    permithourchange = 1;
    setMapHour(hourset);
    updateURL(null);
}
		    }
addButton('<i class="fa fa-square" id="dropcheckicon"></i> Dropoff Intensity',dochange);

addButton('<i class="fa fa-check-square" id="pickcheckicon"></i> Pickup Intensity',function () { if (dopumode == 0) {
    dopumode = 1;
    unanimateWG("#pickcheckicon",['fa-square'],['fa-check-square']);
    unanimateWG("#dropcheckicon",['fa-check-square'],['fa-square']);
    permithourchange = 1;
    setMapHour(hourset);
    updateURL(null);
} });
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
var wgfirstrun = 1; //


function showPositionWG(position) {
    console.log("in callback for showPositionWG"+JSON.stringify(position));
    //iboxlat.value = position.coords.latitude;
    //iboxlong.value = position.coords.longitude;
    if (wgallowposupdate == 1) {
	setMapCenter(position.coords.latitude, position.coords.longitude, null);

	eraseAndAddMarker({lat: position.coords.latitude, lon: position.coords.longitude});
	console.log('added a marker'+JSON.stringify(position.coords));

	if (wgfirstrun == 1) {
	    setTimeout(querylocationbuttonfn,3000);
	    wgfirstrun = 0;
	}
	
	wgallowposupdate = 0;
	unanimateWG("#getlocationicon",['fa-spin','fa-spinner'],['fa-crosshairs']);
    } else { console.log("in callback for showpositionWG redundant! not updating!"); }
}

var permithourchange = 0; //only allow change of hour once per call

var hourset = "00";

//$("#waittimelegend")[0].width = "250px";

function setMapHour(hour2digit) {
    if (permithourchange > 0) {
	hourset = hour2digit;

	if (dopumode == 0) {
	    dropoffstr = "d";
	    $("#legenddo")[0].style.visibility = 'visible';
	    $("#legendpu")[0].style.visibility = 'hidden';
	}
	else {
	    dropoffstr = "";
	    $("#legendpu")[0].style.visibility = 'visible';
	    $("#legenddo")[0].style.visibility = 'hidden';
	}
	//add another layer for speculative testing purposes
	var tilejsonoverlay = {
	    tilejson: '1.0.0',
	    scheme: 'tms',
	    tiles: ['http://{{ servername }}:{{ mapserverport }}/composite'+dropoffstr+'_o'+hour2digit+'/{z}/{x}/{y}.png'],
	    grids: ['http://{{ servername }}:{{ mapserverport }}/composite'+dropoffstr+'_o'+hour2digit+'/{z}/{x}/{y}.grid.json'],
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
    queryexecdone = 1;
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
	    iconSize: [37, 37]

	}),
	title: 'You are here',
	alt: 'You are here',
	opacity: 0.85,
	riseOnHover: true,
	clickable: true
    })
    
    newmarker.on('click', function() { $( "#dialogyah" ).dialog( "open" ); return false; });
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
		head : //['Wait +<br/>Walk (mins)','Walk<br/>(mins)','Direction','Avg. Wait<br/>(mins)','Dropoff &divide; Pickup ratio','Intersection'],
		['<span onclick=\'$( "#dialogtotal" ).dialog( "open" ); return false;\'>Wait +<br/>Walk (mins)</span>',
		 '<span onclick=\'$( "#dialogdst_walk" ).dialog( "open" ); return false;\'>Walk<br/>(mins)</span>',
		 '<span onclick=\'$( "#dialogdirection" ).dialog( "open" ); return false;\'>Compass</span>',
		 '<span onclick=\'$( "#dialogpu_wait" ).dialog( "open" ); return false;\'>Avg. Wait<br/>(mins)</span>',
		 '<span onclick=\'$( "#dialogdo_pu_ratio" ).dialog( "open" ); return false;\'>Dropoff &divide; Pickup</span>',
		 '<span onclick=\'$( "#dialogintersection_name" ).dialog( "open" ); return false;\'>Intersection</span>'],

		json : ['total','dst_walk','direction','pu_wait','do_pu_ratio','intersection_name']
	    });
	    
	    $("#dataTable").jsonTableUpdate(options);

	    i = 1;
	    while (newlocationl.length > 0) {
		newlocation = newlocationl.shift();
		markerlatlng = [newlocation.lat, newlocation.lon];
		//console.log("adding marker at"+markerlatlng);
		var markerid = '#rowgetter'+i;
		var markerobjid =  'marker'+i;
		newmarker = L.marker(markerlatlng, {
		    icon: L.divIcon({
			// Specify a class name we can refer to in CSS.
			className: 'count-icon '+markerobjid,
			// Define what HTML goes in each marker.
			html: i,
			// Set a markers width and height.
			iconSize: [37, 37],
			id: markerobjid //needed to use a closure below instead
		    }),
		    clickable: true
		    
		})
		newmarker.on('click',(function (markerid,markerclass) { return function() {
		    var highlightl = document.getElementsByClassName('highlightmarker');
		    console.log('highlightl size'+highlightl.length);
		    for (i=0; i<highlightl.length; i++) {
			highlightl[i].classList.remove('highlightmarker');
		    }
		    document.getElementsByClassName(markerclass)[0].classList.add('highlightmarker');
		    $('body').scrollTo(markerid,1000);
		    var highlightl = document.getElementsByClassName('rowhighlight');
		    for (i=0; i<highlightl.length; i++) {
			highlightl[i].classList.remove('rowhighlight');
		    }
		    $(markerid)[0].parentNode.parentNode.classList.add('rowhighlight');
		    $('body').scrollTo(markerid,1000);
		    return false; } })(markerid,markerobjid) );

		//when highlighting a row in the table
		var tmphighlightfn = (function (markerid,markerclass) { return function() {
		    var highlightl = document.getElementsByClassName('highlightmarker');
		    console.log('highlightl size'+highlightl.length);
		    for (i=0; i<highlightl.length; i++) {
			highlightl[i].classList.remove('highlightmarker');
		    }
		    document.getElementsByClassName(markerclass)[0].classList.add('highlightmarker');
		    
		    //$('body').scrollTo(markerid,1000);
		    var highlightl = document.getElementsByClassName('rowhighlight');
		    for (i=0; i<highlightl.length; i++) {
			highlightl[i].classList.remove('rowhighlight');
		    }
		    $(markerid)[0].parentNode.parentNode.classList.add('rowhighlight');
		    $('body').scrollTo('#nothingattop',1000);
		    return false; } })(markerid,markerobjid);
		$(markerid).parent().parent().each(function() { this.onclick=tmphighlightfn; });
		//could auto animate
		//if (i==1) { setTimeout(tmphighlightfn,3000); };
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
	    //console.log("finished parsing nearby places");
	    unanimateWG("#querylocationicon",['fa-spin','fa-spinner'],['fa-gears']);
	    permithourchange = 1;
	    setTimeout(function() { setMapHour(json.hour2digit); },1000);

	    //setTimeout(function() { toggleDrawer();
	    //			  },2500);

	}

    });


} //end of queryLocation

function setMapCenter(lat, lon, z) {
    console.log("set map center fired"+lat+" "+lon);
    if ((lat - 40.7) > 0.9 || (lon + 74) > 0.9) {
	alert("Hello, it looks like you are not in NYC or your GPS location is not available. Please center the map at the desired location for a query.");
    }
    else {
	var zoomtarget = max(map.getZoom(),16);
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
    $('#map').height($(window).height() - 85);
    //also change instructions source if needed
    if ($(window).width() < 500) {
	$('#instructions')[0].src = "/static/instructionssmall.svg";
    }
    else if ($(window).height() < 500) {
	$('#instructions')[0].src = "/static/instructionswide.svg";
    }
    else  {
	$('#instructions')[0].src = "/static/instructions.svg";
    }
}



function showInstructions(){
    updateOrientation();
    $("#cover").show();
    $("#instructions").show( "slow" );
};

function dismissInstructions(){
    $("#instructions").fadeOut( "fast" );
    $("#cover").hide();
    setTimeout(function() { if (queryexecdone == 0) { getlocbuttonfn(); }},500);
};


function onceonload() { // What to do on page load:
    updateOrientation(); 


    
    var qsobj = $.QueryString;
    var lat = parseFloat(qsobj['lat']);
    var lon = parseFloat(qsobj['lon']);
    var z = parseInt(qsobj['z']);
    var m = parseInt(qsobj['m']);
    var q = parseInt(qsobj['q']);
    var e = parseInt(qsobj['e']);
    var indate = qsobj['date'];
    var intime = qsobj['time'];
    if (isNaN(lat)) { lat = 40.7; }
    if (isNaN(lon)) { lon = -74.0; }
    //if (lat != null) { setTimeout(function() { console.log('before kick'+map.getCenter()); console.log('kick!'+lat+' '+lon); setMapCenter(lat, lon, null); console.log('before kick'+map.getCenter()); },5000); }
    if (isNaN(z)) { z = 13; }
    if (isNaN(m)) { m = 1; }
    if ((false == isNaN(q)) && q == 1) { showInstructions(); }
    if (isNaN(e)) { e = 0; }

    //set query time fields here to current date and time
    var curdate = new Date();
    var tinput = document.getElementById('wgtimeinput');
    if (null == intime) {
	tinput.value = ("0" + curdate.getHours()).slice(-2)+":"+("0" + curdate.getMinutes()).slice(-2);
    } else { tinput.value = intime; }    
    var dinput = document.getElementById('wgdateinput');
    if (null == indate) {
	dinput.value = curdate.getFullYear() + '-' + String.leftPad(curdate.getMonth() + 1, 2, '0') + '-' + String.leftPad(curdate.getDate(), 2, '0');;
    } else { dinput.value = indate; }
    
    map = new L.Map('map', {center: [lat, lon], zoom:z});
    
    oldlayer.addTo(map);

    $('#instructions').click(dismissInstructions);
    $('#cover').click(dismissInstructions);
    
    setTimeout(function(){ 
	var date = new Date();
	currentHours = date.getHours();
	currentHours = ("0" + currentHours).slice(-2);
	permithourchange = 1;
	setMapHour(currentHours);
	if (m == 0) { dochange(); }
	if (e == 1) { queryLocation(); }
    }, 2000);
    
    map.addEventListener('moveend', updateURL);

    //initialize you are here dialog.
    $( "#dialogyah" ).dialog({ autoOpen: false });    
    $( "#dialogtotal" ).dialog({ autoOpen: false });    
    $( "#dialogdst_walk" ).dialog({ autoOpen: false });    
    $( "#dialogdirection" ).dialog({ autoOpen: false });    
    $( "#dialogpu_wait" ).dialog({ autoOpen: false });    
    $( "#dialogdo_pu_ratio" ).dialog({ autoOpen: false });    
    $( "#dialogintersection_name" ).dialog({ autoOpen: false });    
    //['total','dst_walk','direction','pu_wait','do_pu_ratio','intersection_name']



    
}//end of onceonload

function updateURL(v) {
    latlng = map.getCenter();
    //showPositionWG({'coords':{'latitude':latlng.lat, 'longitude':latlng.lng}});
    var tinput = document.getElementById('wgtimeinput');	
    var dinput = document.getElementById('wgdateinput');	
    history.pushState('page', 'caption', '/ui?lat='+latlng.lat+'&lon='+latlng.lng+'&z='+map.getZoom()+'&m='+dopumode+'&e='+queryexecdone+'&date='+dinput.value+'&time='+tinput.value);
    //console.log('moveend width height'+$(window).width()+' '+$(window).height());
}

//results drawer code
var drawermode = 0; //0 at top, 1 at bottom 
var queryexecdone = 0;

//negative value means the object is above the fold (top of viewport),
//positive value is pixels from top
// Id is : #my-id
function distanceFromViewportTop(id) {
    var scrollTop     = $(window).scrollTop(),
    elementOffset = $(id).offset().top,
    distance      = (elementOffset - scrollTop);
    return distance;
}

function toggleDrawer(e) {
    if (e != null) { e.preventDefault(); }
    if (distanceFromViewportTop('#map') >= 0) {
	$('body').scrollTo('#dataTable',1000);
	$('#chevron1')[0].classList.remove('fa-chevron-up');
	$('#chevron1')[0].classList.add('fa-chevron-down');
    }
    else {
	$('body').scrollTo('#nothingattop',1000);
	$('#chevron1')[0].classList.remove('fa-chevron-down');
	$('#chevron1')[0].classList.add('fa-chevron-up');
    }
}

//change map on change of time
//if changing the query time or day, then modify the map
function eventchangetime() 
{ console.log('onchange fired for the time input box');

  var ttime = new Date();//document.getElementById('time').value);
  var yr = parseFloat($('#wgdateinput')[0].value.slice(0,4));
  ttime.setYear(yr);
  ttime.setMonth(parseFloat($('#wgdateinput')[0].value.slice(5,7))-1);
  ttime.setDate(parseFloat($('#wgdateinput')[0].value.slice(8,10)));
  ttime.setHours(parseFloat($('#wgtimeinput')[0].value.slice(0,2)));
  ttime.setMinutes(parseFloat($('#wgtimeinput')[0].value.slice(3,5)));
  console.log('querying time:'+ttime);
  if (ttime.getHours() >= 0 && ttime.getHours() <= 23) { 
      var twodigithr = ("0" + ttime.getHours()).slice(-2);
      if (hourset != twodigithr) {
	  permithourchange = 1;
	  hourset = twodigithr;
	  setMapHour(hourset);
      }
  }
  updateURL(null);
}
$('#wgtimeinput')[0].onchange = eventchangetime;
$('#wgtimeinput')[0].onmouseup = eventchangetime;

$('#wgdateinput')[0].onchange = eventchangetime;
$('#wgdateinput')[0].onmouseup = eventchangetime;

