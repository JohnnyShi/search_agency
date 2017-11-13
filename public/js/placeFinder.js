var PlaceFinder = function() {
  this.map = new Map($('#map')[0]);
  this.markers = []; // array of markers
  this.init();
};

/*
Get two auto-complete input address, then use geometry location to find target agencies
*/
PlaceFinder.prototype.init = function() {
  var [autocomplete1, autocomplete2] = this.getACAddress();
  $('#search').click(() =>{
    this.getAgencies(autocomplete1.getPlace().geometry.location, autocomplete2.getPlace().geometry.location);
  });
};

/*
Get auto-complete addresses from center of Austin
*/
PlaceFinder.prototype.getACAddress = function(){
  var circle = new google.maps.Circle({
    center:{
      lat: 30.270428,
      lng: -97.742054
    },
    radius: 40000
  })
  var options = {
    type: ['geocode']
  }
  var autocomplete1 = new google.maps.places.Autocomplete((document.getElementById("addr1")), options);
  autocomplete1.setBounds(circle.getBounds());
  var autocomplete2 = new google.maps.places.Autocomplete((document.getElementById("addr2")), options);
  autocomplete2.setBounds(circle.getBounds());
  return [autocomplete1, autocomplete2];
};

/*
Respectively searching real_estate_agencies within 10 miles for two coordinations
*/
PlaceFinder.prototype.getAgencies = function(coord1, coord2){
  var deferredPromises = [];
  var service = new google.maps.places.PlacesService(document.createElement('div'));

  var request1 = {
    location: coord1,
    radius: 16094,
    type: 'real_estate_agency'
  }
  var result1 = new Promise(function (resolve){
    deferredPromises.push({resolve:resolve});
  })
  service.nearbySearch(request1, function (list, status) {
    deferredPromises.pop().resolve(list);
  })

  var request2 = {
    location: coord2,
    radius: 16094,
    type: 'real_estate_agency'
  }
  var result2 = new Promise( function (resolve) {
    deferredPromises.push({resolve:resolve});
  })
  service.nearbySearch(request2, function (list, status) {
    deferredPromises.pop().resolve(list);
  })

  var self = this;
  Promise.all([result1, result2]).then( function(result) {
    var list = result[0].concat(result[1]);

    // C = sin(LatA)*sin(LatB) + cos(LatA)*cos(LatB)*cos(LonA-LonB)
    // Distance = R*Arccos(C)*Pi/180
    var getDistance = (a, b) => 3959 * Math.acos(Math.sin(a.lat()) * Math.sin(b.lat()) + Math.cos(a.lat()) * Math.cos(b.lat()) 
        * Math.cos(Math.abs(a.lng() - b.lng()))) * (Math.PI / 180);
    
    var distance1 = list.map((place) => { return getDistance(coord1, place.geometry.location)});
    var distance2 = list.map((place) => { return getDistance(coord2, place.geometry.location)});
    var pairs = list.map((place, index) =>{ return {name: place.name, location: place.geometry.location,
     distance: distance1[index] + distance2[index]}});
    pairs.sort((a,b) => { return a.distance - b.distance});
    
    var addMarker = (location, self, bounds) => {
      var marker = new google.maps.Marker({
        position: location,
        map: self.map.map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
      });
      self.markers.push(marker);
      bounds.extend(new google.maps.LatLng(location.lat(), location.lng()));
    }

    $('ul li').remove();
    $('#results-list').show();
    self.markers.forEach(function(marker) {
      marker.setMap(null);
    });
    self.markers = [];

    var bounds  = new google.maps.LatLngBounds();
    addMarker(coord1, self, bounds);
    self.markers[0].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
    addMarker(coord2, self, bounds);
    self.markers[1].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
    
    for (var i = 0; i < pairs.length; i++) {
      if (i == 0 || pairs[i].name !== pairs[i-1].name) {
        $('#results').append('<li>' + pairs[i].name + '</li>');
        addMarker(pairs[i].location, self, bounds);
      }
    }
    self.map.map.fitBounds(bounds);
    self.map.map.panToBounds(bounds);
  })
};