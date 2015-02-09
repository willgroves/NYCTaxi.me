/*
			AmCharts.ready(function () {

			    // line chart, with a bullet at the end
			    var chart = new AmCharts.AmSerialChart();
			    chart.dataProvider = [{
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
			    chart.categoryField = "day";
			    chart.autoMargins = false;
			    chart.marginLeft = 0;
			    chart.marginRight = 5;
			    chart.marginTop = 0;
			    chart.marginBottom = 0;

			    var graph = new AmCharts.AmGraph();
			    graph.valueField = "value";
			    graph.bulletField = "bullet";
			    graph.showBalloon = false;
			    graph.lineColor = "#a9ec49";
			    chart.addGraph(graph);

			    var valueAxis = new AmCharts.ValueAxis();
			    valueAxis.gridAlpha = 0;
			    valueAxis.axisAlpha = 0;
			    chart.addValueAxis(valueAxis);

			    var categoryAxis = chart.categoryAxis;
			    categoryAxis.gridAlpha = 0;
			    categoryAxis.axisAlpha = 0;
			    categoryAxis.startOnAxis = true;
			    chart.write("line1");

			//document.getElementById('svg_Yval').textContent='111';
	
			});
*/
