function initialize() {
	// Define SVG container ('viewport')
	var width = 960,
		height = 620;

	// Define projection: Mass State Plane NAD 83 Meters.
	// Standard parallels and rotation (grid origin latitude and longitude) from 
	//     NOAA Manual NOS NGS 5: State Plane Coordinate System of 1983, p. 67.
	// The scale and translation vector were determined empirically.
	var projection = d3.geoConicConformal()
		.parallels([41 + 43 / 60, 42 + 41 / 60])
		.rotate([71 + 30 / 60, -41 ])
		.scale([13000])
		.translate([500,640]);
			
	// Define geo-path generator function
	var geoPath = d3.geoPath().projection(projection);
				
	// Define what to do when panning or zooming - event listener.
	// As of D3V6, event handlers are passed the _event_ and _datum_ as 
	// parameters, and _this_ is being the target node.
	var zooming = function(e, d) {
		// Log e.transform, so you can see all the goodies inside
		// console.log(e.transform);
		
		// New offset array
		var offset = [e.transform.x, e.transform.y];
		// Calculate new scale
		var newScale = e.transform.k * 2000;
		// Update projection with new offset and scale
		projection.translate(offset)
				  .scale(newScale);
		// Update all paths
		svgContainer.selectAll("path")
			.attr("d", geoPath);
	} // zooming()
	
	// Then define the zoom behavior
	// Constrain zoom range to be from 1/6x to 10x (N.B. application of scale factor)
	var zoom = d3.zoom()
				 .scaleExtent([1.0, 60.0])
				 .on("zoom", zooming);
			
	// Define Jenks breaks thresholds for various attribute data in the GeoJSON
	var total_breaks = [0.0023886098, 4036.005, 7316.073, 12581.641, 25230.137, 50286.805],
		auto_breaks =  [0.0014675102, 2797.6472, 4953.6187, 8002.8613, 16233.77, 36423.844],
		transit_breaks = [0.0, 401.84982, 1384.7031, 3005.0884, 6019.087, 12642.579],
		nm_breaks = [0.0, 532.5619, 1388.292, 3221.1729, 7031.4834, 15193.259],
		truck_breaks = [0.0, 676.35846, 1617.0322, 4340.8345, 10960.693, 20621.398];
	
	// 5-step color scale
	var color_palette = [ '#2b83ba', 	// blue
	                      '#abdda4',	// light green
						  '#ffffbf',	// tan-yellow
						  '#fdac61',	// tan-orange
						  '#d7191c', 	// red
						];
	
	var palette = d3.scaleThreshold()
					.domain(total_breaks)
					.range(color_palette);
					
	var svgContainer = d3.select("body")
							.append("svg")
								.attr("width", width)
								.attr("height", height)
								.style("border", "2px solid steelblue");
							
	// Create a container in which all zoomable objects will live
	var map = svgContainer.append("g")
			.attr("id", "map")
			.call(zoom)  //Bind the zoom behavior
			.call(zoom.transform, d3.zoomIdentity  	//Then apply the initial transform.
				.translate(500,640)					// N.B. The translation vector and 	// * was: (500,530)
				.scale(6));							//      scale factor were determined
													//      empirically.
													// N.B. The scale factor is multiplied
													//      by 2,000 in the zoom handler.
															
	//Create a new, invisible background rect to catch zoom events	
	map.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", width)
		.attr("height", height)
		.attr("opacity", 0);
						
	//Load in GeoJSON data
	d3.json("geojson/taz_all_modes.geojson").then(
		function generateMap(tazesFeatureCollection) {	
			map.selectAll("path")
					.data(tazesFeatureCollection.features)
					.enter()
						.append("path")
							.attr("d", function(d, i) { return geoPath(d); })
							.style("stroke", "black")
							.style("stroke-width", "0.5px")
							.style("fill", function(d, i) { 
								return palette(d.properties.total_trips);
								})
							.append("title")
								.text(function(d, i) { return d.properties.town_state + '\ntotal demand: ' + d.properties.total_trips.toFixed(2); });
			
	/*
		// HERE: TBD CODE TO GENERATE LEGEND
	*/
	});
} // initialize()
