var placeFinder = function() {
  this.init();
};

placeFinder.prototype.init = function() {
  var [autocomplete1, autocomplete2] = placeFinder.initAutoComplete();
  $('#address-form').submit(function(e)){
    e.preventDefault();
    var addr1 = autocomplete1.getPlace();
    var addr2 = autocomplete2.getPlace();
    placeFinder.getAgencies(addr1.geometry.location, addr2.geometry.location);
  }
};

placeFinder.prototype.initAutoComplete = function(){
  var circle = new google.maps.Circle({
    center:{
      lat: 30.307182,
      lng: -97.755996
    },
    radius: 40000
  })
  var opts = {
    type: ['geocode'],
  }
  var autocomplete1 = new google.maps.places.Autocomplete((document.getElementById("address1")), opts);
  autocomplete1.setBounds(circle.getBounds());
  var autocomplete2 = new google.maps.places.Autocomplete((document.getElementById("address2")), opts);
  autocomplete2.setBounds(circle.getBounds());
  return [autocomplete1, autocomplete2];
};

placeFinder.prototype.getAgencies = function(coords1, coords2){
  var request1 = {
    location: coords1,
    radius: 16094, // m
    type: 'real_estate_agency'
  }
  var deferred_promises = []
  var result1 = new Promise(function (resolve){
    deferred_promises.push({resolve:resolve});
  })
  var service = new google.maps.places.PlacesService(document.createElement('div'));
  service.nearbySearch(request1, function (list, status) {
    deferred_promises.pop().resolve(list);
  })

  // same thing for the second address
  var request2 = {
    location: coords2, // google.maps.LatLng obj
    radius: 16094, // 10 miles
    type: 'real_estate_agency'
  }

  var result2 = new Promise( function (resolve) {
    deferred_promises.push({resolve:resolve});
  })

  // the API response should go to the right result array
  // but it doesn't really matter if they don't since we
  // treat all returned results for either address the same way
  service.nearbySearch(request2, function (list, status) {
    deferred_promises.pop().resolve(list);
  })

  Promise.all([result1, result2]).then( function(result) {
    // combine the two lists
    var list = result[0].concat(result[1]);
    // calculate the distance from each result to each address
    var distance1 = list.map( function(place) { return address.getDistance(coords1, place.geometry.location)});
    ar distance2 = list.map( function(place) { return address.getDistance(coords2, place.geometry.location)});

    // add the distances together and return an array of objects
    // containing relevant information
    // depending on our purposes, more information could be included here
    // (e.g phone number, addresses)
    // since it's not clear yet what actions we're taking on this list and
    // more information requires more API calls, I'm just leaving the name of
    // the places for the purpose of this exercise
    var names_and_distances = list.map( function(place, indx) {
      return {name: place.name, distance: distance1[indx] + distance2[indx]}
    })

    // sort by distance
    names_and_distances.sort(address.comparePlaces);

    // display results
    $('#results-wrapper').show();

    address.showPlace(names_and_distances[0]);

    for (var i = 1; i < names_and_distances.length; i++) {
      if (names_and_distances[i].name !== names_and_distances[i - 1].name) {
        address.showPlace(names_and_distances[i])
      }
    }
  })
};

placeFinder.prototype.getDistance = function(coords1, coords2){
  var earth_radius_in_miles = 3959
  var lat1 = coords1.lat();
  var lat2 = coords2.lat();
  var lng1 = coords1.lng();
  var lng2 = coords2.lng();
  return earth_radius_in_miles * Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(Math.abs(lng1 - lng2))) * (Math.PI / 180);
}

placeFinder.prototype.comparePlaces = function(place1, place2){
  if (place1.distance < place2.distance){
    return -1
  }
  return 1
}

placeFinder.prototype.showPlace = function(place){
  var result = $('#results');
  results.append('<li>' + place.name + '</li>');
}
