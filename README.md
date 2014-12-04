#San Francisco Film Locations Map

A simple map displaying film locations in San Francisco.

A demo of this app is hosted on Heroku at:

https://floating-shelf-6158.herokuapp.com/

##Functionalities

The app launches with a map of San Francisco displaying all 1151 film locations.

The user can click on a marker to view more information about the movie.

To see filming locations for a movie, the user can search for the movie title, or append /#title to the url field.

The film location data comes from 
https://data.sfgov.org/Culture-and-Recreation/Film-Locations-in-San-Francisco/yitu-d5am?

##Back-end

I use Flask to create the web app.

The API endpoints are
- '/api/locations' gives all film locations
- '/api/locations/<title>' gives film locations for a single movie
- '/api/titles' gives a list of all movie titles in the dataset, this is used for the autocompletion search function

##Front-end

The front-end javascript framework is backbone.js. I use bootstrap.js for the layout and style.

Google Map API is used for geocoding the location information and creating the map. 
To avoid lags from the geocoder, I have retrieved the latitude/longitude information for all locations beforehand.

The autocompletion search functionality is implemented using typeahead.js and the bloodhound engine.


