const $ = require('jquery')

// https://developers.google.com/maps/documentation/javascript/infowindows
// https://developers.google.com/maps/documentation/javascript/examples/infowindow-simple
// https://developers.google.com/maps/documentation/javascript/directions

//this implements google map api to our module
module.exports = {

  //init a map with only one marker. Used to show store's location
  initSingleMap: (json, curIpLoc, route, transitMode) => {

    let loc = {lat: json.coordinates.latitude, lng: json.coordinates.longitude}

    let map = new google.maps.Map(document.getElementById('businessLocationMap'), {zoom: 15, center: loc});
    new google.maps.Marker({position: loc, map: map});

    if (route) {
      let curLoc = new google.maps.LatLng(curIpLoc.split(' ')[0], curIpLoc.split(' ')[1]);
      let directionsService = new google.maps.DirectionsService();
      let directionsRenderer = new google.maps.DirectionsRenderer({map: map})

      directionsService.route({
        origin: curLoc,
        destination: loc,
        travelMode: transitMode
      }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {

          let element = response.routes[0].legs[0];
          directionsRenderer.setDirections(response);
          $('#businessLocationMapTravelInfo').empty();
          $('#businessLocationMapTravelInfo').append(`<p id="travelDistance">Distance: ${element.distance.text}</p>
                                                      <p id="travelTime">Time: ${element.duration.text}</p>`);
          //
          // if (element.distance.value < 30000) {
          // } else {
          //   // new google.maps.Marker({position: loc, map: map});
          // }
        } else {
          alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
        }
      });
    }
  },

  // init map with multiple markers. Used for search view.
  initMultiMap: (json) => {
    console.log(json)

    const centerLat = json
      .map(x => x.coordinates.latitude)
      .reduce((a, b) => a + b, 0) / json.length;

    const centerLong = json
      .map(x => x.coordinates.longitude)
      .reduce((a, b) => a + b, 0) / json.length;


    var map = new google.maps.Map(document.getElementById('businessesLocationsMap'), {
      zoom: 10,
      center: {lat: centerLat, lng: centerLong}
    });

    let markers = [];

    for (const bizIndex in json) {
      const curBiz = json[bizIndex];

      let marker = new google.maps.Marker(
        {
          map: map,
          position: { lat: curBiz.coordinates.latitude, lng: curBiz.coordinates.longitude },
          clickable: true
        });

      // todo: encode the url here to go the the store page as well
      const contentText = `<a id="${curBiz.id}" href="http://localhost:8080/store/${curBiz.id}">
                              <p id="mapWindowTitle">${curBiz.name}</p>
                              <img src="${curBiz.image_url}">
                              <p id="mapWindowPrice">${curBiz.price}</p>
                              <p id="mapWindowRating">${curBiz.rating}</p>
                              </a>
                           `;

      let infoWindow = new google.maps.InfoWindow({ content: contentText })

      marker.addListener('click', function() { infoWindow.open(map, marker); });

      markers.push(marker);



    }
    // {lat: 38.6630016, lng: -90.3277921}
    // new google.maps.Marker({position: {lat: 38.6630016, lng: -90.3277921}, map: map});

    // todo: unable to access local img files
    new MarkerClusterer(map, markers, {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
  },

  getLoc: (lat, long, callback) => {
    new google.maps.Geocoder().geocode(
      { location: new google.maps.LatLng(lat, long) },
      (res) => {
        let addressComponent = res[0]["address_components"]

        return callback({
          city: addressComponent[4].short_name,
          state: addressComponent[5].short_name,
          zip: addressComponent[7].short_name
        })
    })
  }
}

