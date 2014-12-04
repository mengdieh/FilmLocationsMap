$(function() {
/*----------- uses backbone.js to add/clean markers on map -------------*/

// the collection of locations - the model collection of the MVC framework
var LocationList = Backbone.Collection.extend({
  url: '/api/locations',

  initialize: function() {
    this.allLocations = [];
  },

  fetch: function() {
    // loads all movie locations
    var self = this;
    $.getJSON('/api/locations', function(response) {
      self.allLocations = response['locations'];
      self.reset(self.allLocations);
    });
  }
});

var locations = new LocationList();

// a MarkerView is tied to each location
var MarkerView = Backbone.View.extend({
  initialize: function(options) {
    this.map = options.map;
    MarkerView.infowindow = null;

    if( !this.model.Latitude || !this.model.Longitude ) { 
      // if lat&lng are not preloaded, load them first
      // use setTimeOut to avoid OVER_QUERY_LIMIT
      setTimeout(function() {
        geocoder.geocode({'address': this.model.LocationText + ", San Francisco, CA"}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            var loc = results[0].geometry.location;
            this.model.Latitude = loc.lat();
            this.model.Longitude = loc.lng();
            createMarker();
          } 
        });
      }, 2500);
    }
    else
      this.createMarker();
  },

  createMarker: function() {
    // creates a marker
    var latlng = new google.maps.LatLng(this.model.Latitude, this.model.Longitude);
    var marker = new google.maps.Marker({
      position: latlng,
      map: this.map,
      title: this.model.Title,
    // animation: google.maps.Animation.DROP
    });
    this.marker = marker;

    // creates an infowindow
    var contentString = '<h5>' + this.model.Title + ' (' + this.model['Release Year']+ ')</h5>'
                      + '<p>Director: ' + this.model.Director + '</br>'
                      + 'Location: ' + this.model.LocationText;
    if( this.model['Fun Facts'] ) 
      contentString += '</br>' + 'Fun Fact: ' + this.model['Fun Facts'] + '</p>';
    else
      contentString += '</p>';                  

    var infowindow = new google.maps.InfoWindow({
      content: contentString,
    });

    // shows infowindow when clicking on the marker
    // MarkerView.infowindow records the last open infowindow
    // always closes the last infowindow before opening a new one
    google.maps.event.addListener(marker, 'click', function() {
      if(MarkerView.infowindow)
        MarkerView.infowindow.close();
      MarkerView.infowindow = infowindow;
      infowindow.open(this.map, marker);
    });    
  },

  show: function() {
    this.marker.setMap(this.map);
  },

  hide: function() {
    this.marker.setMap(null);
  },
})

// top-level view of the map
var AppView = Backbone.View.extend({
  initialize: function() {
    this.loadMap();
    this.collection = locations; 
    this.markers = [];
    this.listenTo(this.collection, 'reset', this.render )
    this.collection.fetch(); // loads the entire movie collection on page load to polulate the map
  },

  loadMap: function() {
  // loads google map
    var mapOptions = {
      center: new google.maps.LatLng(37.7577,-122.4376), // San Francisco
      scrollWheel: false,
      zoom: 12
    };
    this.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  },

  render: function() {
  // renders markers for all locations in the collection
    // in the first round, create markers for all known locations
    if( this.markers.length == 0 && this.collection.allLocations.length > 0 ) {
      for(var i = 0; i < this.collection.allLocations.length; i++ ) {
        this.markers.push(new MarkerView({model:this.collection.allLocations[i], map:this.map}));
      }      
    }

    // clears map
    for(var i = 0; i < this.markers.length; i++ )
      this.markers[i].hide();

    // turns on markers for the current collection and centers map around the visible markers
    var bounds = new google.maps.LatLngBounds();
    for(var i = 0; i < this.collection.models.length; i++ ) {
      var markerView = this.markers[this.collection.at(i).attributes.LocationId];
      markerView.show();
      bounds.extend(markerView.marker.position);
    }
    this.map.fitBounds(bounds);
  },

  // showLocations() and showAllLocations() make changes to the model,
  // the map view adjusts itself when the model fires the 'reset' event
  showLocations: function(locationIds) {
    locations.reset(locationIds);
  },

  showAllLocations: function() {
    locations.reset(locations.allLocations);
  },
})

var appView = new AppView();

// the router addes #title to the url when a movie is selected
var Router = Backbone.Router.extend({
  routes: {
    ":query": "selectMovie",
    "": "selectAll"
  },
  selectAll: function() {
    appView.showAllLocations();
  },
  selectMovie: function(query) {
    $.getJSON('/api/locations/' + query.toLowerCase(), function(response) {
      appView.showLocations(response.locations);
    });
  }
});

var router = new Router();

Backbone.history.start();


/*------ using typeahead.js and bloodhound.js for autocompletion ------*/
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
})
.on('typeahead:selected', function(e, data){ // when selected, navigate to /#title
    router.navigate(data.value, {trigger:true});
  });
});