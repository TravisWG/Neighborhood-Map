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

	for (var i = 0; i < initialLocations.length; i++) {
		var marker = new google.maps.Marker({
			map: map,
			position: initialLocations[i].location,
			title: initialLocations[i].title
		});
	}
}
