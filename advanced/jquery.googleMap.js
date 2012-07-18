/**
* jQuery Google Map Helper
* Copyright (c) 2012 Kevin Doyle & Jonathan Hopkins
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
**/

(function($) {  
	$.fn.googleMap = function(options) {
		var defaults = {
			mapType: "roadmap"
		}
		var options = $.extend(defaults, options);
		return this.each(function() {
			var obj = $(this)[0],
				mapTypeDisplay, mapOptions, map, geocoder, bounds, tempLatLng, tempMarker, tempLat, tempLng, initialset, infowindow;

			switch(options.mapType){
				case "roadmap":
					mapTypeDisplay = google.maps.MapTypeId.ROADMAP;
					break;
				case "satellite":
					mapTypeDisplay = google.maps.MapTypeId.SATELLITE;
					break;
				case "hybrid":
					mapTypeDisplay = google.maps.MapTypeId.HYBRID;
					break;
				case "terrain":
					mapTypeDisplay = google.maps.MapTypeId.TERRAIN;
					break;
			}
			
			mapOptions = {
				zoom: 8,
				center: new google.maps.LatLng(0,0),
				mapTypeId:mapTypeDisplay
			}
			
			map = new google.maps.Map(obj,mapOptions);
			infowindow = new google.maps.InfoWindow();
			
			$.ajax({
				type: "GET",
				dataType: "json",
  				url: "data.json",
				success: function(data) {
					// loop thru sets and determine center and zoomlevel for each set, also add each point to map
					for (i = 0; i < data.sets.length; i++) {
						var set = data.sets[i];
						bounds = new google.maps.LatLngBounds();
						for (j = 0; j < set.points.length; j++) {
							var point = set.points[j];
							tempLatLng = new google.maps.LatLng(point.latlng[0],point.latlng[1]);
							tempMarker = new google.maps.Marker({
								map: map,
								position: tempLatLng,
								//icon: (options.icon)?(options.icon):(null)
								icon: null
							});
							
							// add info window
							google.maps.event.addListener(tempMarker, 'click', (function(tempMarker, j) {
								return function() {
									infowindow.setContent(set.points[j].content);
									infowindow.open(map, tempMarker);
								}
							})(tempMarker, j));
							
							
							// add marker to map
							bounds.extend(tempMarker.getPosition());
						}
						
						// store bounds for later use
						set.bounds = bounds;
					}
					
					// set the bounds to the initial set or the first
					if (data.initialset !== null) {
						for (i = 0; i < data.sets.length; i++) {
							if (data.sets[i].setid === data.initialset) {
								map.fitBounds(data.sets[i].bounds);
								setTimeout(function() {map.setZoom(Math.min(map.getZoom(), 15));}, 50);
								
								// set link to active
								$(".set").removeClass("active");
								$("#" + data.initialset).addClass("active");
							}
						}
					} else {
						map.fitBounds(data.sets[0].bounds);
						setTimeout(function() {map.setZoom(Math.min(map.getZoom(), 15));}, 50);
						
						
						// set link to active
						$(".set").removeClass("active");
						$("#" + data.sets[0].setid).addClass("active");
					}
					
					// add click event to any buttons for sets
					$(".set").click(function() {
						curid = $(this).attr("id");	
						
						// loop thru to find id to get bounds
						for (i = 0; i < data.sets.length; i++) {
							if (data.sets[i].setid === curid) {
								map.fitBounds(data.sets[i].bounds);
								map.setZoom(Math.min(map.getZoom(), 15));
								
								// set link to active
								$(".set").removeClass("active");
								$(this).addClass("active");
							}
						}
						
						return false;
					});
				}
			});
		});
	}
})(jQuery);