


function loadPlots( dataprovider ) 
{
	var svg = $('#target').svg('get');
	var  target = $('#target')[0];
	var drawcnt = 0; //number of right side plots so far
	var drawcntleft = 0; //number of left side plots so far
	for (var i=0; i<placementdata.length; i++) {
		var d = placementdata[i];
		if (placementdata[i].type == "plot" && dataprovider[0][d.name] != null) {
	    	var drawx = 30;
	    	var drawy = 40;
	    	if (d.rl == 'r') {
	    		drawx = 750;
	    		drawy= drawy+drawcnt*100;
	    		drawcnt++;
			} else {
				drawx = 40;
				drawy = drawy+drawcntleft*100;
				drawcntleft++;
			}
			var t;
			t = svg.group();
			t.setAttribute('transform','translate(0,0)');
			t.setAttribute('class','cl_'+d.name);
			t.setAttribute('onmousedown',"startMove(evt)");
			t.setAttribute('onmouseup','drop()');
			t.$x = 0;
			t.$y = 0;
			var tt;
			tt = svg.rect(t,drawx,drawy,146,86, 8, 8, {'fill':'#cccccc','stroke':'#000000','stroke-width':'2'});
			tt = svg.text(t,drawx+73,drawy+19,d.description,{'text-anchor':'middle', 'font-family':'serif', 'font-size':"15", 'stroke-width':"0", 'stroke':"#000000", 'fill':"#000000"});
			tt = svg.rect(t,drawx+10,drawy+29,96,51, 0, 0, {'fill':'#efeeee','stroke':'#000000','stroke-width':'1','stroke-linecap':"null",'stroke-linejoin':"null"});
			//Add value information here
			var dname = d.name;
			var valstr = 'VAL';
			var valchgstr = 'VALCH';
			//alert(dataprovider[dataprovider.length-1][dname]);
			var lastval = parseFloat(dataprovider[dataprovider.length-1][dname]);
			var nextlastval = parseFloat(dataprovider[dataprovider.length-2][dname]);
			var valchg = lastval-nextlastval;
			
			tt = svg.text(t,drawx+125,drawy+48,lastval.toFixed(2),{'text-anchor':'middle', 'font-family':'serif', 'font-size':"12", 'stroke-width':"0", 'stroke':"#000000", 'fill':"#000000"});
			tt = svg.text(t,drawx+125,drawy+73,valchg.toFixed(3),{'text-anchor':'middle', 'font-family':'serif', 'font-size':"12", 'stroke-width':"0", 'stroke':"#aa0000", 'fill':"#aa0000"});
			

			var xshift = 0;
			if (d.rl == 'l') { xshift=xshift+148; }
			tt = svg.polyline(null,[[drawx+xshift,drawy+40],[d.dotcoord[0], d.dotcoord[1]]],{'fill':'none','stroke':'green','strokeWidth':2,});

		
			//Here is the plotting div
			//if ($('#'+'plotter_'+d.name).length == 0) {
			var mydiv = document.getElementById('plotter_'+d.name);
			if (mydiv != null) { mydiv.parentNode.removeChild(mydiv); }
			var div = document.createElement('div');
			div.setAttribute('variablename',d.name);
			div.textContent = d.name;
             div.setAttribute('style','position:absolute;left:'+(drawx*1+10)+'px;top:'+(drawy*1+29)+'px;width:'+'96px'+';height:'+'51px'+';');
            div.setAttribute('id','plotter_'+d.name);
			target.appendChild(div);
			placePlainPlot('plotter_'+d.name,dataprovider,"time",d.name);
			
			
			tt = svg.circle(null, d.dotcoord[0], d.dotcoord[1], d.dotcoord[2], {'fill':'green','stroke':'green','strokewidth':1,'class':'circle'});
			tt.setAttribute('transform','translate(0,0)');		
//  <rect ry="8" rx="8" stroke="#000000" fill="#cccccc" stroke-width="2" id="svg_5" height="86.000001" width="145.999997" y="92" x="661"/>
//  <text xml:space="preserve" text-anchor="middle" font-family="serif" font-size="15" id="svg_7" y="110" x="703" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="0" stroke="#000000" fill="#000000">Income (Y)</text>
//  <text id="svg_Yval" xml:space="preserve" text-anchor="middle" font-family="serif" font-size="15" y="138.75" x="785" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="0" stroke="#000000" fill="#000000">Val</text>
//  <text stroke="#000000" xml:space="preserve" text-anchor="middle" font-family="serif" font-size="15" id="svg_Ydelta" y="166" x="786" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="0" fill="#000000">Chg</text>
//  <rect stroke="#000000" id="plotY" height="51" width="95.999998" y="121" x="669" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" fill="#ff9e9e"/>
}}}


//simple debugging function, will write plot data to div at id
// The div should already be placed somewhere with a top,left,width,height 
// already set in the style
function placePlainPlot(id,dataprovider,dpxname,dpyname) {
			    // line chart, with a bullet at the end
			    var chart = new AmCharts.AmSerialChart();
			    chart.dataProvider = dataprovider;
			    chart.categoryField = dpxname;//"day";
			    chart.autoMargins = false;
			    chart.marginLeft = 0;
			    chart.marginRight = 5;
			    chart.marginTop = 0;
			    chart.marginBottom = 0;

			    var graph = new AmCharts.AmGraph();
			    graph.valueField = dpyname;//"value";
			    graph.bulletField = "bullet";
			    graph.showBalloon = false;
			    graph.lineColor = "#000000";
			    chart.addGraph(graph);

			    var valueAxis = new AmCharts.ValueAxis();
			    valueAxis.gridAlpha = 0;
			    valueAxis.axisAlpha = 0;
			    chart.addValueAxis(valueAxis);

			    var categoryAxis = chart.categoryAxis;
			    categoryAxis.gridAlpha = 0;
			    categoryAxis.axisAlpha = 0;
			    categoryAxis.startOnAxis = true;
			    chart.write(id);
}

function placeResponsePlot(id,dataprovider,xaxis,yaxis) {
var chart = AmCharts.makeChart(id, {
    "type": "xy",
    "theme": "none",
    "pathToImages": "http://www.amcharts.com/lib/3/images/",
    "dataProvider": dataprovider,
    "valueAxes": [],
    //"startDuration": 1,
    "graphs": [{
        "balloonText": "x:[["+xaxis+"]] y:[["+yaxis+"]]",
        "bullet": "triangleUp",
        "lineAlpha": 0,
        "xField": xaxis,
        "yField": yaxis,
        "lineColor": "#FF6600",
		"fillAlphas": 0
    }],
    "trendLines": [{
        "finalValue": dataprovider[dataprovider.length-2][yaxis],
        "finalXValue": dataprovider[1][xaxis],//dataprovider[dataprovider.length-2][xaxis],
        "initialValue": dataprovider[1][yaxis],
        "initialXValue": dataprovider[1][xaxis],
        "lineColor": "#66FF00"
    },
    {
        "finalValue": dataprovider[dataprovider.length-2][yaxis],
        "finalXValue": dataprovider[dataprovider.length-2][xaxis],
        "initialValue": dataprovider[1][yaxis],
        "initialXValue": dataprovider[dataprovider.length-2][xaxis],
        "lineColor": "#66FF00"
    }],
    "marginLeft": 0,
    "marginBottom": 0,
    //"chartScrollbar": {},
    "chartCursor": {}
});
}

var bogusdataprovider = [{
			        "day": 1,
			            "value": 120
			    }, {
			        "day": 2,
			            "value": 124
			    }, {
			        "day": 3,
			            "value": 127
			    }, {
			        "day": 4,
			            "value": 122
			    }, {
			        "day": 5,
			            "value": 121
			    }, {
			        "day": 6,
			            "value": 123
			    }, {
			        "day": 7,
			            "value": 118
			    }, {
			        "day": 8,
			            "value": 113
			    }, {
			        "day": 9,
			            "value": 122
			    }, {
			        "day": 10,
			            "value": 125,
			        bullet: "round"
			    }];

function loadResponsePlots(responsel) 
{
	var svg = $('#responsetarget').svg('get');
	var  target = $('#responsetarget')[0];
	var drawcnt = 0; //number of right side plots so far
	var drawcntleft = 0; //number of left side plots so far
	for (var i=0; i<placementdata.length; i++) {
		var d = placementdata[i];
		if (placementdata[i].type == "curve") {
	    	var drawx = 30;
	    	var drawy = 40;
	    	if (d.rl == 'r') {
	    		drawx = 750;
	    		drawy= drawy+drawcnt*140;
	    		drawcnt++;
			} else {
				drawx = 20;
				drawy = drawy+drawcntleft*140;
				drawcntleft++;
			}
			var t;
			t = svg.group();
			t.setAttribute('transform','translate(0,0)');
			t.setAttribute('class','cl_'+d.name);
			t.setAttribute('onmousedown',"startMove(evt)");
			t.setAttribute('onmouseup','drop()');
			t.$x = 0;
			t.$y = 0;
			var tt;
			tt = svg.rect(t,drawx,drawy,168,134, 2, 2, {'fill':'#eeeeee','stroke':'#000000','stroke-width':'2'});
			tt = svg.text(t,drawx+83,drawy+19,d.description,{'text-anchor':'middle', 'font-family':'serif', 'font-size':"13", 'stroke-width':"0", 'stroke':"#000000", 'fill':"#000000"});
			tt = svg.rect(t,drawx+10,drawy+29,146,100, 0, 0, {'fill':'#ffffff','stroke':'#000000','stroke-width':'1','stroke-linecap':"null",'stroke-linejoin':"null"});
			//Add value information here
			var dname = d.name;
			
			var xshift = 0;
			if (d.rl == 'l') { xshift=xshift+168; }
			tt = svg.polyline(null,[[drawx+xshift,drawy+40],[d.dotcoord[0], d.dotcoord[1]]],{'fill':'none','stroke':'brown','strokeWidth':2,});

		
			//Here is the plotting div
			
			var mydiv = document.getElementById('respplotter_'+d.name);
			if (mydiv != null) { mydiv.parentNode.removeChild(mydiv); }
			var div = document.createElement('div');
			div.setAttribute('variablename',d.name);
			div.textContent = d.name;
            div.setAttribute('style','font-size:8; position:absolute;left:'+(drawx*1+10-9)+'px;top:'+(drawy*1+29-13)+'px;width:'+'166px'+';height:'+'120px'+';');
            div.setAttribute('id','respplotter_'+d.name);
			target.appendChild(div);
			//find responsel info for this particular one if it exists in the input
			//}

			for (var respi=0; respi<responsel.length; respi++) {
				//console.log("Whos is this? "+responsel[respi][0]+","+responsel[respi][1]);	
				if (responsel[respi][0]+","+responsel[respi][1] == d.name) { 
					//console.log("found a match!! "+responsel[respi][0]+","+responsel[respi][1]+" "+d.name);
					placeResponsePlot('respplotter_'+d.name,responsel[respi][2],responsel[respi][0],responsel[respi][1]);
				}
			}
			
			tt = svg.circle(null, d.dotcoord[0], d.dotcoord[1], d.dotcoord[2], {'fill':'brown','stroke':'brown','strokewidth':1,'class':'circle'});
			tt.setAttribute('transform','translate(0,0)');		
//  <rect ry="8" rx="8" stroke="#000000" fill="#cccccc" stroke-width="2" id="svg_5" height="86.000001" width="145.999997" y="92" x="661"/>
//  <text xml:space="preserve" text-anchor="middle" font-family="serif" font-size="15" id="svg_7" y="110" x="703" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="0" stroke="#000000" fill="#000000">Income (Y)</text>
//  <text id="svg_Yval" xml:space="preserve" text-anchor="middle" font-family="serif" font-size="15" y="138.75" x="785" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="0" stroke="#000000" fill="#000000">Val</text>
//  <text stroke="#000000" xml:space="preserve" text-anchor="middle" font-family="serif" font-size="15" id="svg_Ydelta" y="166" x="786" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="0" fill="#000000">Chg</text>
//  <rect stroke="#000000" id="plotY" height="51" width="95.999998" y="121" x="669" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" fill="#ff9e9e"/>
}}}

