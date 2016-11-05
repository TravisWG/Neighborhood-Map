//Model Data
var markers = [];

  	//Takes results from Google Text search and creates
	function gymMarkers(results){
		for (var i = 0; i < results.length; i++) {
			var marker = new google.maps.Marker({
				map: map,
				position: results[i].geometry.location,
				title: results[i].name
			});
			marker.address = results[i].formatted_address;
			markers.push(marker);

			marker.addListener('click', function() {
            	createInfoWindow(this, largeInfowindow);
          	});
        }
        console.log(results);
        createListings();
	};







var map;

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 46.8772, lng: -96.7898},
	  zoom: 13
		});

	largeInfowindow = new google.maps.InfoWindow();

	var gymLocations = {
  	  location: map.center,
  	  radius: '20000',
   	  query: 'gym'
 	};

 	service = new google.maps.places.PlacesService(map);
  	service.textSearch(gymLocations, gymMarkers);
};

	function createInfoWindow(clickedmarker, infowindow){
		var inforWindowContent = "<div><b>" + clickedmarker.title + "</b></div><br><div>" + clickedmarker.address + "</div>"
		if (infowindow.marker != clickedmarker) {
			infowindow.marker = clickedmarker;
			infowindow.setContent(inforWindowContent);
			infowindow.open(map, clickedmarker);

		};
	};

	function createListings() {
		for (var i = 0; i < markers.length; i++) {
			var listingsContent = "<div><h3>" + markers[i].title + "</h2>" + markers[i].address + "</div><hr>";
			$('#listings').append(listingsContent);
		}
	};

