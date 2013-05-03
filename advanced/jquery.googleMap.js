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
			mapType: "roadmap",
			url: "data.json"
		}
		var options = $.extend(defaults, options);
		return this.each(function() {
			var obj = $(this)[0],
				mapTypeDisplay, mapOptions, map, bounds, tempLatLng, tempMarker, initialset, infowindow;

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
				zoom:8,
				maxZoom:15,
				center:new google.maps.LatLng(0,0),
				mapTypeId:mapTypeDisplay
			}
			
			map = new google.maps.Map(obj, mapOptions);
			infowindow = new google.maps.InfoWindow();
			
			$.ajax({
				type: "GET",
				dataType: "json",
  				url: options.url,
				success: function(data) {
					// loop thru sets and add each point to map with infowindow
					for (i = 0; i < data.sets.length; i++) {
						var set = data.sets[i];
						bounds = new google.maps.LatLngBounds();
						for (j = 0; j < set.points.length; j++) {
							var point = set.points[j];
							tempLatLng = new google.maps.LatLng(point.latlng[0],point.latlng[1]);
							tempMarker = new google.maps.Marker({
								map: map,
								position: tempLatLng,
								icon: (set.points[j].icon)?(set.points[j].icon):(null)
							});
							
							// store marker for later use
							point.marker = tempMarker;
							
							// add info window
							google.maps.event.addListener(tempMarker, 'click', (function(tempMarker, j, i) {
								return function() {
									infowindow.setContent(data.sets[i].points[j].content);
									infowindow.open(map, tempMarker);
								}
							})(tempMarker, j, i));
							
							// add marker to map
							bounds.extend(tempMarker.getPosition());
						}
						
						// store bounds for later use
						set.bounds = bounds;
					}
					
					// set the bounds to the initial set or the first
					var curset = "";
					if (data.initialset !== null) {
						for (i = 0; i < data.sets.length; i++) {
							if (data.sets[i].setid === data.initialset) curset = data.sets[i];
						}
						// if specified initial set is not found, use first set instead
						if (curset == "") curset = data.sets[0];
					} else {
						curset = data.sets[0];
					}
					map.fitBounds(curset.bounds);
					
					// set link to current
					$(".goto").removeClass("current");
					$('a.goto[data-id="' + curset.setid + '"]').addClass("current");
					
					
					// add click event to go to the set
					$(".goto").click(function() {
						curid = $(this).data("id");	
						
						// loop thru to find id to get bounds
						for (i = 0; i < data.sets.length; i++) {
							if (data.sets[i].setid === curid) {
								map.fitBounds(data.sets[i].bounds);
								map.setZoom(Math.min(map.getZoom(), 15));
								
								// set link to current
								$(".goto").removeClass("current");
								$(this).addClass("current");
							}
						}
						
						return false;
					});
					
					
					// add click event to go to the set
					$(".toggle").click(function() {
						curid = $(this).data("id");	
						
						// loop thru to find id to get bounds
						for (i = 0; i < data.sets.length; i++) {
							if (data.sets[i].setid === curid) {
								for (j = 0; j < data.sets[i].points.length; j++) {
									curmarker = data.sets[i].points[j].marker;
									if (!curmarker.getVisible()) {
										curmarker.setVisible(true);
										$('a.toggle[data-id="' + curid + '"]').removeClass("invisible");
									} else {
										curmarker.setVisible(false);
										$('a.toggle[data-id="' + curid + '"]').addClass("invisible");
									}
								}
							}
						}
						
						return false;
					});
					
					
					// add submit event to form to goto zip
					$("#mapaddressform").submit(function() {
						var geocoder = new google.maps.Geocoder();	
						geocoder.geocode({'address': $("#mapaddress").val()}, function(results, status) {
							if (status === google.maps.GeocoderStatus.OK) {
								map.setCenter(results[0].geometry.location);
								map.setZoom(14);
							} else if(status === google.maps.GeocoderStatus.ZERO_RESULTS) {
								options.onGeocodeError.call(this);
							}
						});
						
						return false;
					});
				}
			});
		});
	}
})(jQuery);