//Model Data
var markers = [];
var userLocation;



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
        console.log(markers);
        createListings(markers);
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

	function createListings(markers) {
		$('#listings').empty();
		for (var i = 0; i < markers.length; i++) {
			var listingsContent = "<div><h3>" + markers[i].title + "</h3>" + markers[i].address + "</div><hr>";
			$('#listings').append(listingsContent);
		}
	};

    function hideMarkers(markerList) {
        for (var i = 0; i < markerList.length; i++) {
          markerList[i].setMap(null);
        }
    };

     function setMarkers(markerList) {
        console.log(markerList);
        for (var i = 0; i < markerList.length; i++) {
          markerList[i].setMap(map);
        }
    };

	function withinDistance() {
    	var service = new google.maps.DistanceMatrixService();
		var userLocation = document.getElementById('location').value;
		if (userLocation == ""){
			window.alert('A starting location is required.')
		} else{
			hideMarkers(markers);
			var gymDestinations = [];
			for (var i = 0; i < markers.length; i++){
				gymDestinations.push(markers[i].address)
			}
		console.log(gymDestinations)

		service.getDistanceMatrix({
	    	origins: [userLocation],
	    	destinations: gymDestinations,
	    	unitSystem: google.maps.UnitSystem.IMPERIAL,
	    	travelMode: 'WALKING',
	  	}, function(response, status) {
            if (status !== google.maps.DistanceMatrixStatus.OK) {
              window.alert('Error was: ' + status);
            } else {
              	filterByDistance(response);
            }
          });
        }
    }

	function filterByDistance(response){
		console.log(response)
		var withinDistance = document.getElementById('max-miles').value;
		console.log(withinDistance)
		var results = response.rows[0].elements;
		var filteredMarkers = []
		for (var i = 0; i < results.length; i++) {
			var meters = results[i].distance.value;
			var miles = metersToMiles(meters);
			if (miles <= withinDistance) {
				markers[i]
				filteredMarkers.push(markers[i])
			}
		}
		setMarkers(filteredMarkers);
		createListings(filteredMarkers);
	}

	//converts meters to miles, rounding to the tenth
	function metersToMiles(numberMeters){
		var toMileConversion = 0.000621371
		var miles = numberMeters * toMileConversion
		var miles = Math.round(miles * 10)/10
		return miles
	}

	console.log(metersToMiles(381778))
