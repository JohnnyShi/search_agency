var Map = function(mapElem) {
  this.map = null;
  this.mapElem = mapElem;
  this.init();
};
Map.prototype.init = function() {
  var mapOptions = {
    center: new google.maps.LatLng(30.270428, -97.742054),
    zoom: 14,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  this.map = new google.maps.Map(this.mapElem, mapOptions);
};

