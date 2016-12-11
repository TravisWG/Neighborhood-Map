//Model Data
var map;
var markers = [];
var userMarker;
var userLocationInput;
var markerList = [];
var maxMiles;



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

    	// marker.addListener('click', function() {
     //    	createInfoWindow(markerLIst, largeInfowindow);
     //    	console.log(markers)
     //  	});
    }
    ko.applyBindings(new ViewModel());

    //calls all the Foursquare JSON requests
    for (i = 0; i < markerList.length; i++){
    	markerList[i].getFoursquarePhoneNumber(markerList[i]);
    }
}

var Marker = function(data) {
	var self = this;
	this.markerData = data;  //Google Maps marker data associated with this object
	this.markerData.addListener('click', function() {
		createInfoWindow(this, self, largeInfowindow);
	});
	this.position = this.markerData.position;
	this.title = ko.observable(data.title);
	this.address = ko.observable(data.address);
	this.distance = ko.observable();
	this.distanceText = ko.computed(function(){
		return this.distance() + " miles from your selected location.";
	}, this);
	this.belowDistance = ko.observable(true);
	this.phoneNumber = ko.observable();
	this.selector = ko.observable(false);


	//Creates string to make request to Foursquare API.  Uses Marker object's latlng and title to make more specific request
	this.foursquareRequest = "https://api.foursquare.com/v2/venues/search?ll=" + this.position.lat() + "," + this.position.lng() + "&limit=1&query=" +
		this.title() + "&client_id=1KVAFVXFJAXEUUCTRXXNH44P1ECKFTIIRQQKIDPHJVVGMHSC&client_secret=F5HCLY4X51JD3D45MNTMUQFVUZVGSC3M1HIRFVQVTT4B23W0&v=20161127";

	//Makes JSON request using foursquareRequest string, returns venue ID to use for later searches
	this.getFoursquarePhoneNumber = function(obj){
		$.getJSON(obj.foursquareRequest, function(data) {
			if (data.response.venues.length !== 0 && data.response.venues[0].contact.formattedPhone !== undefined){
				var formattedPhoneNumber = data.response.venues[0].contact.formattedPhone;
				obj.phoneNumber(formattedPhoneNumber);
		        }
		  	else{
		        obj.phoneNumber("Contact info is unavailable for this location.");
		    }
		})
		.success(function(){
	        console.log("passed!");
	    })
		.fail(function(){
		    console.log('fail!');
		    obj.phoneNumber("Contact info is unavailable for this location.");
		});
	};
};

var ViewModel = function() {
	var self = this;

	markers.forEach(function(markerItem){
		markerList.push( new Marker(markerItem) );
		});

	this.distance = ko.observable(false);
	this.speed = ko.observable(5);  //default value at 5 mph

	maxMiles = ko.observable(1);
	userLocationInput = ko.observable();

	this.maxDistance = [
		{ name: '1 mile', miles: 1 },
		{ name: '2 miles', miles: 2 },
		{ name: '3 miles', miles: 3 },
		{ name: '4 miles', miles: 4 },
		{ name: '5 miles', miles: 5 }
	];

	this.runSpeed = [
		{ name: '5 MPH', speed: 5 },
		{ name: '6 MPH', speed: 6 },
		{ name: '7 MPH', speed: 7 },
		{ name: '8 MPH', speed: 8 },
		{ name: '9 MPH', speed: 9 },
		{ name: '10 MPH', speed: 10 },
		{ name: '11 MPH', speed: 11 },
		{ name: '12 MPH', speed: 12 }
	];

	//Minutes to MM:SS converter taken from http://stackoverflow.com/questions/17599054/is-there-a-simple-way-to-convert-a-decimal-time-e-g-1-074-minutes-into-mmss
	// Credit to user Matt Johnson
	//Reformatted for suitable use
	this.formattedTime = ko.computed(function(){
 		minutes = (this.distance() / this.speed().speed * 60);
 		var sign = minutes < 0 ? "-" : "";
 		var min = Math.floor(Math.abs(minutes));
 		var sec = Math.floor((Math.abs(minutes) * 60) % 60);
 		return sign + (min < 10 ? "0" : "") + min + " minutes and " + (sec < 10 ? "0" : "") + sec + " seconds.";
	}, this);

	this.changeCurrentMarker = function(data){
		resetMarkers(markerList);
		data.markerData.setIcon("http://maps.google.com/mapfiles/ms/icons/yellow-dot.png");
		data.selector(true);
		self.distance(data.distance());
	};
};

function createInfoWindow(clickedmarker, markerListItem, infowindow){
	var inforWindowContent = "<div><b>" + clickedmarker.title + "</b></div><br><div>" + clickedmarker.address + "</div><br><div>" + markerListItem.phoneNumber() + "</div>";
	if (infowindow.marker != clickedmarker) {
		infowindow.marker = clickedmarker;
		infowindow.setContent(inforWindowContent);
		infowindow.open(map, clickedmarker);
		resetMarkers(markerList);
		markerListItem.markerData.setIcon("http://maps.google.com/mapfiles/ms/icons/yellow-dot.png");
	}
}

function hideMarkers(markerList) {
    for (var i = 0; i < markerList.length; i++) {
      markerList[i].markerData.setMap(null);
    }
}

function setMarkers(markerList) {
    for (var i = 0; i < markerList.length; i++) {
    	if (markerList[i].belowDistance() === true) {
      		markerList[i].markerData.setMap(map);
       	}
    }
}

function resetMarkers(markerList) {
	for (var i = 0; i < markerList.length; i++) {
		markerList[i].markerData.setIcon("http://maps.google.com/mapfiles/ms/icons/red-dot.png");
		markerList[i].selector(false);
	}
}

//function takes in a userLocation that is input by the user and determines distances from all marker locations
//calls function filterByDistance()
function withinDistance() {
	var service = new google.maps.DistanceMatrixService();
	var userLocation = userLocationInput();
	if (userLocation === ""){
		window.alert('A starting location is required.');
	} else{
		hideMarkers(markerList);
		userLocationMarker(userLocation);
		var gymDestinations = [];
		for (var i = 0; i < markers.length; i++){
			gymDestinations.push(markers[i].address);
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
	var withinDistance = maxMiles().miles;
	console.log(withinDistance);
	var results = response.rows[0].elements;
	for (var i = 0; i < results.length; i++) {
		var meters = results[i].distance.value;
		var miles = metersToMiles(meters);
		markerList[i].distance(miles);
		if (miles >= withinDistance) {
			markerList[i].belowDistance(false);
		}
		else {
			markerList[i].belowDistance(true);
		}
	}
	setMarkers(markerList);

}

function userLocationMarker(userLocation){
	geocoder = new google.maps.Geocoder();
	geocoder.geocode({'address': userLocation}, function(results, status) {
	    if (status === 'OK') {
	     	if (userMarker !== undefined){ //if current userMarker, resets position
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
	}
	setMarkers(markerList);
}

//converts meters to miles, rounding to the tenth
//called by filterByDistance()
function metersToMiles(numberMeters) {
	var toMileConversion = 0.000621371;
	var miles = numberMeters * toMileConversion;
	var roundedMiles = Math.round(miles * 10)/10;
	return roundedMiles;
}

function menuTransition() {
	if ( $(".col-3").css("right") == "-250px") {
		$(".col-3").css("right", "0px");
		$("img").css("right", "255px");
	}
	else {
		$(".col-3").css("right", "-250px");
		$("img").css("right", "5px");
	}
}

function mapErrorHandling() {
	alert('Google Maps did not load successfully' );

}

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 46.8772, lng: -96.7898},
	  zoom: 11
		});

	largeInfowindow = new google.maps.InfoWindow();

	service = new google.maps.places.PlacesService(map);

 	service.textSearch({
  		location: map.center,
  		radius: '20000',
   		query: 'gym'
    }, function(results, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            gymMarkers(results);
          }
          else {
          	alert('Google Maps Places Service did not load successfully for the following reason: ' + status);
          }
        });
}

