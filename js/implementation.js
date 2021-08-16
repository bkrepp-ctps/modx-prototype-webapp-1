function initialize() {
	d3.json("geojson/taz_all_modes.geojson").then(
		function generateMap(tazesFeatureCollection) {	
			// Define SVG container ('viewport')
			var width = 960,
				height = 620;
				
			var svgContainer = d3.select("body").append("svg")
				.attr("width", width)
				.attr("height", height)
				.style("border", "2px solid steelblue");

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
			
			// Define Jenks breaks thresholds for various data
			var total_breaks = [0.0023886098, 4036.005, 7316.073, 12581.641, 25230.137, 50286.805],
			auto_breaks =  [0.0014675102, 2797.6472, 4953.6187, 8002.8613, 16233.77, 36423.844],
			transit_breaks = [0.0, 401.84982, 1384.7031, 3005.0884, 6019.087, 12642.579],
			nm_breaks = [0.0, 532.5619, 1388.292, 3221.1729, 7031.4834, 15193.259],
			truck_breaks = [0.0, 676.35846, 1617.0322, 4340.8345, 10960.693, 20621.398];
			
			// 5-step color scale
			var color_palette = [ '#d7191c', '#fdac61', '#ffffbf', '#abdda4', '#2b83ba' ];
			
			var palette = d3.scaleThreshold()
							.domain(total_breaks)
							.range(color_palette);
							
			// Create SVG <path> for each town
			var svgTazes = svgContainer
				.selectAll("path")
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
			// Generate legend
			// Create data array ({color, text} pairs) for legend
			var i,
				legendData = [];
			for (i = 0; i < palette.domain().length; i++) {
				legendData.push( { 'color': palette.range()[i], 
								   'text': i < palette.domain().length-1 ? '< ' + palette.domain()[i].toString() 
																		 : '>= ' + palette.domain()[i-1].toString() } );
			}	
				
			svgContainer.selectAll("rect")
				.data(legendData)
				.enter()
				.append("rect")
					.attr("height", 28)
					.attr("width", 28)
					.attr("x", function(d,i) { return 10 + (i * 50); } )
					.attr("y", height-50)
					.style("stroke", "black")
					.style("stroke-width", "0.5px")
					.style("fill", function(d,i) { return d.color; });	
					
			svgContainer.selectAll("text")
				.data(legendData)
				.enter()
				.append("text")
					.attr("x", function(d,i) { return 10 + (i * 50); } )
					.attr("y", height-8)
					.text(function(d,i) { return d.text; } )
					.style("font-size", "12px");
					
			svgContainer.append("text")
				.attr("x", 10)
				.attr("y", height-60)
				.style("font-size", "14px")
				.style("font-weight", "bold")
				.text("Population Density in 2010 (pop/sq-mi)");
	*/
	});
} // initialize()
