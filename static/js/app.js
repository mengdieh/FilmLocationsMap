$(function() {
/*------ using typeahead.js and bloodhound.js for autocompletion ---------*/
// constructs the suggestion engine
var engine = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  limit:10,
  prefetch: {
    url: '/api/titles',
    filter: function(result) {
      return $.map(result.titles, function(title) {return {value:title}; });
    }
  }
});
// kicks off the loading/processing of `local` and `prefetch`
engine.initialize();

$('#bloodhound .typeahead').typeahead({
  hint: true,
  highlight: true,
  minLength: 1
},
{
  name: 'movies',
  displayKey: 'value',
  // `ttAdapter` wraps the suggestion engine in an adapter that
  // is compatible with the typeahead jQuery plugin
  source: engine.ttAdapter()
});

/*-------------------- end autocompletion ------------------------------*/

/*---------- using backbone.js to add/clean markers on map -------------*/

// the collection of locations, each movie can have multiple locations
var LocationList = Backbone.Collection.extend({

});

var locations = new LocationList();

// top-level view of the map
var AppView = Backbone.View.extend({
  initialize: function() {

  },

  render: function() {

  }


})

var appView = new AppView();

// router
var Router = Backbone.Router.extend({
  routes: {
    "movie:query": "markMovie",
    "": "markAll"
  },
  initialize: function() {
    //appView.render();
  },
  markAll: function() {
    
  },
  markMovie: function() {

  }
});

var router = new Router();

//Backbone.history.start();
        
/* google maps -----------------------------------------------------*/

google.maps.event.addDomListener(window, 'load', initialize);

function initialize() {

  var latlng1 = new google.maps.LatLng(52.3731, 4.8922);
  var latlng2 = new google.maps.LatLng(59.32522, 18.07002);

  var mapOptions = {
    center: latlng1,
    scrollWheel: false,
    zoom: 13
  };
  
  var bounds = new google.maps.LatLngBounds();

  var marker = new google.maps.Marker({
    position: latlng1,
    title: "Amsterdam",
//    animation: google.maps.Animation.DROP
  });

  var infowindow = new google.maps.InfoWindow({
      content: '<p>yadayada</p>'
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map,marker);
  });

  bounds.extend(marker.position);

  var marker2 = new google.maps.Marker({
    position: latlng2,
    title: "Stockholm",
  });
  bounds.extend(marker2.position);
  
  var map = new google.maps.Map(document.getElementById("map-canvas"));//, mapOptions);
  marker.setMap(map);
  marker2.setMap(map);
  map.fitBounds(bounds);
};

/* end google maps -----------------------------------------------------*/
        
});