//Model Data
var initialLocations = [
		{title: "Fercho YMCA", location : {lat : 46.850461,lng: -96.85245200000001}},
		{title: "Schlossman YMCA", location : {lat : 46.87261849999999, lng : -96.786259}}
	];

var map;

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 46.8772, lng: -96.7898},
	  zoom: 13
		});

	var largeInfowindow = new google.maps.InfoWindow();

	var gymLocations = {
  	  location: map.center,
  	  radius: '5000',
   	  query: 'gym'
 	 };

 	service = new google.maps.places.PlacesService(map);
  	service.textSearch(gymLocations, gymMarkers);

	function gymMarkers(results){
		console.log(results)
		for (var i = 0; i < results.length; i++) {
			var marker = new google.maps.Marker({
				map: map,
				position: results[i].geometry.location,
				title: results[i].name
			});
			marker.address = results[i].formatted_address;

			marker.addListener('click', function() {
            	createInfoWindow(this, largeInfowindow);
          	});
		}
	};

	function createInfoWindow(clickedmarker, infowindow){
		var inforWindowContent = "<div><b>" + clickedmarker.title + "</b></div><br><div>" + clickedmarker.address + "</div>"
		if (infowindow.marker != clickedmarker) {
			infowindow.marker = clickedmarker;
			infowindow.setContent(inforWindowContent);
			infowindow.open(map, clickedmarker);

		}
	}
};
