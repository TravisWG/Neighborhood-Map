//Model Data
var map;
var markers = [];
var userLocation;
var userMarker;
var markerList = [];

//Takes results from Google Text search and creates markers and marker arrays
function gymMarkers(results){
	for (var i = 0; i < results.length; i++) {
		var marker = new google.maps.Marker({
			map: map,
			position: results[i].geometry.location,
			title: results[i].name,
			address: results[i].formatted_address,
			icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
		});
		markers.push(marker);
		marker.addListener('click', function() {
        	createInfoWindow(this, largeInfowindow);
      	});
    }

    ko.applyBindings(new ViewModel());
};

var Marker = function(data) {
	this.markerData = data;
	this.position = this.markerData.position;
	this.title = ko.observable(data.title);
	this.address = ko.observable(data.address);
	this.distance = ko.observable();
	this.distanceText = ko.computed(function(){
		return this.distance() + " miles from your selected location."
	}, this);
	this.belowDistance = ko.observable(true);

	//Creates string to make request to Foursquare API.  Uses Marker object's latlng and title to make more specific request
	this.foursquareRequest = "https://api.foursquare.com/v2/venues/search?ll=" + this.position.lat() + "," + this.position.lng() + "&limit=1&query=" +
		this.title() + "&client_id=1KVAFVXFJAXEUUCTRXXNH44P1ECKFTIIRQQKIDPHJVVGMHSC&client_secret=F5HCLY4X51JD3D45MNTMUQFVUZVGSC3M1HIRFVQVTT4B23W0&v=20161127";

	//Makes JSON request using foursquareRequest string, returns venue ID to use for later searches
	this.getFoursquareID = function(){
		$.getJSON(this.foursquareRequest, function(data) {
	        var venueID = data.response.venues[0].id;
	        return venueID
	    })
		.success(function(){
        console.log('hurray!')
    	})
	    .error(function(){
	        console.log('fail!')
	    });
	};

	//Creates string to use for hours search in Foursquare API.  Uses returned Venue ID from getFoursquareID() to complete search.
	this.foursquareHoursRequest = "https://api.foursquare.com/v2/venues/" + this.getFoursquareID + "/hours" + "&client_id=1KVAFVXFJAXEUUCTRXXNH44P1ECKFTIIRQQKIDPHJVVGMHSC&client_secret=F5HCLY4X51JD3D45MNTMUQFVUZVGSC3M1HIRFVQVTT4B23W0&v=20161127";

	//Makes JSON request using foursquareHoursRequest, will return hours, but currently console.log(data) to peruse for parsing.
	this.getFoursquareHours = function(){
		$.getJSON(this.foursquareHoursRequest, function(data) {
	        console.log(data)
	    })
		.success(function(){
        	console.log('hurray!')
    	})
	    .error(function(){
	        console.log('fail!')
	    });
	};
};

var ViewModel = function() {
	var self = this;

	markers.forEach(function(markerItem){
		markerList.push( new Marker(markerItem) );
	});

	this.changeCurrentMarker = function(data){
		console.dir(data.title());
		self.currentMarker(data);
		resetMarkerColor(markerList);
		data.markerData.setIcon("http://maps.google.com/mapfiles/ms/icons/yellow-dot.png");
		data.getFoursquareID()
    };

	this.currentMarker = ko.observable();
};



function createInfoWindow(clickedmarker, infowindow){
	var inforWindowContent = "<div><b>" + clickedmarker.title + "</b></div><br><div>" + clickedmarker.address + "</div>"
	if (infowindow.marker != clickedmarker) {
		infowindow.marker = clickedmarker;
		infowindow.setContent(inforWindowContent);
		infowindow.open(map, clickedmarker);

	};
};

function hideMarkers(markerList) {
    for (var i = 0; i < markerList.length; i++) {
      markerList[i].markerData.setMap(null);
    }
};

function setMarkers(markerList) {
    console.log(markerList);
    for (var i = 0; i < markerList.length; i++) {
    	if (markerList[i].belowDistance() == true) {
      		markerList[i].markerData.setMap(map);
       	}
    }
    console.log(markerList[2].markerData)
};

function resetMarkerColor(markerList) {
	for (var i = 0; i < markerList.length; i++) {
		markerList[i].markerData.setIcon("http://maps.google.com/mapfiles/ms/icons/red-dot.png")
	}
};

//function takes in a userLocation that is input by the user and determines distances from all marker locations
//calls function filterByDistance()
function withinDistance() {
	var service = new google.maps.DistanceMatrixService();
	var userLocation = document.getElementById('location').value;
	if (userLocation == ""){
		window.alert('A starting location is required.')
	} else{
		hideMarkers(markerList);
		userLocationMarker(userLocation);
		var gymDestinations = [];
		for (var i = 0; i < markers.length; i++){
			gymDestinations.push(markers[i].address)
		}

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

//takes in data generated by withinDistance() and determines if marker location is within the distance of location chosen by user
//and creates new array data in filteredMarkers of locations that are within that distance
function filterByDistance(response){
	var withinDistance = document.getElementById('max-miles').value;
	var results = response.rows[0].elements;
	console.log(results);
	for (var i = 0; i < results.length; i++) {
		var meters = results[i].distance.value;
		var miles = metersToMiles(meters);
		markerList[i].distance(miles);
		if (miles >= withinDistance) {
			markerList[i].belowDistance(false);
			console.log(markerList)

		}
		else {
			markerList[i].belowDistance(true);
		}
	}
	setMarkers(markerList);

};

function userLocationMarker(userLocation){
	geocoder = new google.maps.Geocoder();
	geocoder.geocode({'address': userLocation}, function(results, status) {
      if (status === 'OK') {
      	if (userMarker !== undefined){ //if current userMarker, resets position
      		console.log(userMarker);
			userMarker.setPosition(results[0].geometry.location);
   		}
		else{  //if no current userMarker, creates userMarker
			userMarker = new google.maps.Marker({
				map: map,
				position: results[0].geometry.location,
				title: "Your Location",
				animation: google.maps.Animation.BOUNCE,
				icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
			});
		}
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
}

function clearFilter() {
	for (var i = 0; i < markerList.length; i++) {
		markerList[i].belowDistance(true);
		markerList[i].distance('');
	};
	setMarkers(markerList);
};

//converts meters to miles, rounding to the tenth
//called by filterByDistance()
function metersToMiles(numberMeters) {
	var toMileConversion = 0.000621371
	var miles = numberMeters * toMileConversion
	var miles = Math.round(miles * 10)/10
	return miles
};

function selectBike() {
	$('#speedSelector').empty();
	$('#speedSelector').append(bikeDiv)
};

function selectRun() {
	$('#speedSelector').empty();
	$('#speedSelector').append(runDiv)
};

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 46.8772, lng: -96.7898},
	  zoom: 12
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

