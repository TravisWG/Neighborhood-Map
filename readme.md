The app can be loaded by opening index.html in a web browser.

The app generates gym locations using a fixed latitude and longitude
based in Fargo, ND.  The locations are found by using the Google Maps
API Places Service.  A map with complementary markers of the gym locations is also created using the Google Maps API and previously described Places Service data.  Map markers can be clicked on and will show location name and address.

The app can filter the locations based on distance from a given location.  The user can input a location address and distance that would like to search within and the app will show only the locations that fit the "within distance" parameters.  Unfortunately, the app is only currently set up to work with locations within the Fargo/Moorhead area.  A planned change would be to have the user input search using the Places Service and generate a new map and markers.

An example of a working search would be "2500 Main Ave Fargo".

Clicking on any of the list item will bring up the locations address and phone number.  Phone numbers are gathered using the Foursquare API.  Clicking a list item will also change the color of the associated map marker.

Another feature of the app is the time estimator.  This lets the user select an average pace and will show an estimated time to the location that is currently selected in the list view.
