// Copyright (c) 2015 Mapzen
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
// Based on code by Patrick.Brockmann@lsce.ipsl.fr, see 
// http://bl.ocks.org/PBrockmann/raw/230f567762de650953b5/

var cities_data = {},
    data_keys = ["km_new_roads", "inland_water_area_named", "km_new_oneways", "total_road_segments",
					  "building_address_count", "building_area", "inland_water_length_named",
					  "km_edits_to_existing_oneways", "building_count", "km_new_named_roads",
					  "km_edits_to_existing_named_roads", "km_edits_to_existing_roads",
					  "inland_water_length", "inland_water_area", "aerialway_count"];


$("#slider").slider({
	 value: 2015,
	 min: 2008,
	 max: 2015,
	 step: 1,
	 slide: function( event, ui ) {
		  $("#year").val(ui.value);
		  redraw(ui.value.toString());
		  }
});
$("#year").val($("#slider").slider("value") );

	 var w = 900;
	 var h = 500;
var selected_cities = {};

	 var xy = d3.geo.equirectangular()
        .scale(150);

	 var path = d3.geo.path()
		  .projection(xy);

	 var svg = d3.select("#graph").insert("svg:svg")
		  .attr("width", w)
        .attr("height", h);

	 var states = svg.append("svg:g")
		  .attr("id", "states");

	 var circles = svg.append("svg:g")
		  .attr("id", "circles");

	 var labels = svg.append("svg:g")
		  .attr("id", "labels");

	 d3.json("world-countries.json", function(collection) {
		  states.selectAll("path")
				.data(collection.features)
				.enter().append("svg:path")
				.attr("d", path)
            .on("mouseover", function(d) {
                d3.select(this).style("fill","#6C0")
                    .append("svg:title")
                    .text(d.properties.name);})
            .on("mouseout", function(d) {
                d3.select(this).style("fill","#ccc");});
	 });


	 var scalefactor=1/50.0 ;
	 var chart = null,
    last_selected = [],
    last_column = '';

	 function update_graph() {
		  var colelem = document.getElementById("column"),
        column = colelem[colelem.selectedIndex].value,
        coltext = colelem[colelem.selectedIndex].innerText;
		  var year = document.getElementById("slider").value || "2015";

		  var max_val = 0.0;
		  var gdata = Object.keys(cities_data).map(function(city_name) {
				var cdata = cities_data[city_name];
				obj = {}
				obj.name = city_name;
				obj.lat = 0.5 * (cdata.bbox[1] + cdata.bbox[3]);
				obj.lon = 0.5 * (cdata.bbox[0] + cdata.bbox[2]);
				Object.keys(cdata)
					 .filter(function(k) {
						  return isFinite(+k);
					 })
					 .map(function(k) {
						  var val = cdata[k][column];
						  if (val > max_val) { max_val = val; }
						  obj[k] = val;
					 });
				return obj;
		  });
		  scalefactor = 40.0 / Math.sqrt(max_val);
		  
		  var circ_update = circles.selectAll("circle")
				.data(gdata);

		  circ_update
				.enter()
				.append("svg:circle")
				.attr("cx", function(d, i) { return xy([d.lon,d.lat])[0]; })
				.attr("cy", function(d, i) { return xy([d.lon,d.lat])[1]; })
            .on("mouseover", function(d) {
                d3.select(this).classed("over", true);})
            .on("mouseout", function(d) {
                d3.select(this).classed("over", false);})
				.on("click", function(d) {
					 var sel = d3.select(this);
					 if (sel.classed("selected")) {
						  sel.classed("selected", false);
						  delete selected_cities[d.name];
						  update_chart();
					 } else {
						  sel.classed("selected", true);
						  selected_cities[d.name] = true;
						  update_chart();
					 }
				});

		  circ_update
				.attr("r",  function(d) { return Math.sqrt(+d[year])*scalefactor; })
				.attr("title",  function(d) { return d["name"]+": "+Math.round(d[year]); });

		  circ_update.exit().remove();
	 }

	 function redraw(year) {
        circles.selectAll("circle")
				.transition()
				.duration(1000).ease("linear")
				.attr("r",  function(d) { return Math.sqrt(+d[year])*scalefactor; })
				.attr("title",  function(d) { return d["name"]+": "+Math.round(d[year]); });

        labels.selectAll("text")
				.text(function(d) { return Math.round(d[year]); });
	 }

var chart = null,
    last_selected = {},
    last_column = '';

function update_chart() {
  var colelem = document.getElementById("column"),
      column = colelem[colelem.selectedIndex].value,
      coltext = colelem[colelem.selectedIndex].innerText;

	 Object.keys(selected_cities).map(function(city_name) {
	 	  if (last_selected[city_name] &&
	 			column == last_column) {
	 			return;
	 	  }

	 	  var city_data = cities_data[city_name];

	 	  city_data = Object.keys(city_data)
	 			.filter(function(k) {
	 				 return isFinite(+k);
	 			})
	 			.map(function(k) {
	 				 obj = {}
	 				 obj.year = "" + k + "-01-01";
	 				 obj[city_name] = city_data[k][column];
	 				 return obj;
	 			});

	 	  if (chart) {
	 			chart.load({
	 				 id: city_name,
	 				 json: city_data,
	 				 type: 'line',
	 				 keys: {
	 					  x: 'year',
	 					  value: [city_name]
	 				 }
	 			});
	 	  } else {
	 			chart = c3.generate({
	 				 bindto: '#chart',
	 				 data: {
	 					  id: city_name,
	 					  json: city_data,
	 					  type: 'line',
	 					  keys: {
	 							x: 'year',
	 							value: [city_name]
	 					  }
	 				 },
	 				 axis: {
	 					  x: {
	 							type: 'timeseries',
	 							tick: {
	 								 format: '%Y-%m-%d'
	 							}
	 					  }
	 				 }
	 			});
	 	  }
    });

	 Object.keys(last_selected).map(function(city_name) {
	 	  if (!selected_cities[city_name]) {
	 			chart.unload(city_name);
	 	  }
	 });

	 last_selected = {};
	 Object.keys(selected_cities).map(function(city_name) {
		  last_selected[city_name] = true;
	 });
	 last_column = column;
}

function load_data(city) {
	 // TODO: put proper, public URL in here!
	 d3.json("/" + city + ".json", function(json) {

		  Object.keys(json).map(function(d) {
				if (isFinite(+d)) {
					 Object.keys(d).map(function(r) {
						  if (data_keys.indexOf(r) == -1) {
								delete d[r];
						  }
					 });
				}
		  });

		  cities_data[city] = json;
		  update_graph();
	 });
}

load_data("aarhus_denmark");
load_data("abidjan_ivory_coast");
load_data("abuja_nigeria");
load_data("accra_ghana");
load_data("adelaide_australia");
load_data("albany_new_york");
load_data("amsterdam_netherlands");
load_data("athens_greece");
load_data("atlanta_georgia");
load_data("auckland_new_zealand");
load_data("austin_texas");
load_data("bangkok_thailand");
load_data("barcelona_spain");
load_data("beijing_china");
load_data("berlin_germany");
load_data("bogota_colombia");
load_data("boston_massachusetts");
load_data("brasilia_brazil");
load_data("brisbane_australia");
load_data("brussels_belgium");
load_data("bucharest_romania");
load_data("budapest_hungary");
load_data("buenos_aires_argentina");
load_data("cairo_egypt");
load_data("cape_town_south_africa");
load_data("chennai_india");
load_data("chicago_illinois");
load_data("copenhagen_denmark");
load_data("dallas_texas");
load_data("dc_baltimore_maryland");
load_data("denver_boulder_colorado");
load_data("detroit_michigan");
load_data("dubai_abu_dhabi");
load_data("dublin_ireland");
load_data("edinburgh_scotland");
load_data("frankfurt_germany");
load_data("hong_kong_china");
load_data("houston_texas");
load_data("hyderabad_india");
load_data("istanbul_turkey");
load_data("jakarta_indonesia");
load_data("johannesburg_south_africa");
load_data("krakow_poland");
load_data("kuala_lumpur_malaysia");
load_data("kyiv_ukraine");
load_data("lagos_nigeria");
load_data("lisbon_portugal");
load_data("london_england");
load_data("los_angeles_california");
load_data("lyon_france");
load_data("madrid_spain");
load_data("manchester_england");
load_data("manila_philippines");
load_data("melbourne_australia");
load_data("mexico_city_mexico");
load_data("miami_florida");
load_data("milan_italy");
load_data("minsk_belarus");
load_data("montreal_canada");
load_data("moscow_russia");
load_data("mumbai_india");
load_data("naples_italy");
load_data("new_delhi_india");
load_data("new_orleans_louisiana");
load_data("new_york_new_york");
load_data("oslo_norway");
load_data("ottawa_canada");
load_data("perth_australia");
load_data("philadelphia_pennsylvania");
load_data("portland_oregon");
load_data("prague_czech_republic");
load_data("saint_petersburg_russia");
load_data("san_diego_tijuana_mexico");
load_data("san_francisco_bay_california");
load_data("san_francisco_california");
load_data("san_jose_california");
load_data("santiago_chile");
load_data("sao_paulo_brazil");
load_data("seattle_washington");
load_data("seoul_south_korea");
load_data("shanghai_china");
load_data("singapore");
load_data("sydney_australia");
load_data("taipei_taiwan");
load_data("tel_aviv_israel");
load_data("tokyo_japan");
load_data("toronto_canada");
load_data("vancouver_canada");
load_data("venice_italy");
load_data("warsaw_poland");
load_data("zurich_switzerland");
