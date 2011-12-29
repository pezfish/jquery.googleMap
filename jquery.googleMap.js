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
			LatLng: [0, 0],
			zoom: 8, //higher number means zoom in further
			icon: false,
			alt: false,
			mapType: "roadmap",
			onGeocodeError: function(){}
		}
		var options = $.extend(defaults, options);
		return this.each(function() {
			var obj = $(this)[0];
			var mapLatLng = new google.maps.LatLng(options.LatLng[0],options.LatLng[1]);
			var mapTypeDisplay;

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
			
			var mapOptions = {
				zoom: options.zoom,
				center: mapLatLng,
				mapTypeId:mapTypeDisplay
				
			}
			var map = new google.maps.Map(obj,mapOptions);
			if(options.address){
				var geocoder = new google.maps.Geocoder();	
				geocoder.geocode( { 'address': options.address}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						map.setCenter(results[0].geometry.location);
						if(options.icon){
							var marker = new google.maps.Marker({
								map: map, 
								position: results[0].geometry.location,
								icon:options.icon
							})
						} else {
							var marker = new google.maps.Marker({
								map: map, 
								position: results[0].geometry.location
							});
						}
					} else if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
						defaults.onGeocodeError.call(this);
					}
				});
			} else {
				if(options.icon){
					var marker = new google.maps.Marker({
						map: map, 
						position: mapLatLng,
						icon:options.icon
					})
				} else {
					var marker = new google.maps.Marker({
						map: map, 
						position: mapLatLng
					});
				}
			}
		});
	}
})(jQuery);