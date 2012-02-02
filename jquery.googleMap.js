/**
* jQuery Google Map Helper
* Copyright (c) 2011 Kevin Doyle
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
**/

(function($) {  
	$.fn.googleMap = function(options) {
		var defaults = {
			address: false,
			LatLng: [[0, 0]],			
			zoom: 8, //higher number means zoom in further
			icon: false,
			alt: false,
			mapType: "roadmap",
			onGeocodeError: function(){}
		}
		var options = $.extend(defaults, options);
		return this.each(function() {
			var obj = $(this)[0],
				mapLatLng = new google.maps.LatLng(options.LatLng[0][0],options.LatLng[0][1]),
				mapTypeDisplay, mapOptions, map, geocoder, bounds, tempLatLng, tempMarker, tempLat, tempLng;

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
				zoom: (options.zoom === "auto")?(0):(options.zoom),
				center: mapLatLng,
				mapTypeId:mapTypeDisplay
			}
			
			bounds = new google.maps.LatLngBounds();
			map = new google.maps.Map(obj,mapOptions);
			if(options.address){
				var geocoder = new google.maps.Geocoder();	
				geocoder.geocode({'address': options.address}, function(results, status) {
					if (status === google.maps.GeocoderStatus.OK) {
						map.setCenter(results[0].geometry.location);
						var marker = new google.maps.Marker({
							map: map, 
							position: results[0].geometry.location,
							icon: (options.icon)?(options.icon):(null)
						});
					} else if(status === google.maps.GeocoderStatus.ZERO_RESULTS) {
						options.onGeocodeError.call(this);
					}
				});
			} else {
				for (var i=0; i<=options.LatLng.length-1; i++){
					tempLatLng = new google.maps.LatLng(options.LatLng[i][0],options.LatLng[i][1]);
					tempMarker = new google.maps.Marker({
						map: map,
						position: tempLatLng,
						icon: (options.icon)?(options.icon):(null)
					});
					bounds.extend(tempMarker.getPosition());
				}
				if(options.zoom === "auto"){
					map.fitBounds(bounds);
				}
			}
		});
	}
})(jQuery);