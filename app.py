# imports
from flask import Flask, jsonify, render_template
import csv, json

app = Flask(__name__)

# loads movie data from the csv file
movie_data = {}
all_locations = []
with open('sfmovies.csv') as csvfile:
	rdr = csv.DictReader(csvfile)
	i = 0
	for row in rdr:
		title_norm = row['Title'].lower()
		all_locations.append({ \
				'LocationId': i, \
				'Title': row['Title'], \
				'Release Year': row['Release Year'], \
				'Director': row['Director'], \
				'Writer': row['Writer'], \
				'LocationText':row['Locations'], \
				'Latitude':row['Latitude'], \
				'Longitude':row['Longitude'], \
				'Fun Facts':row['Fun Facts']
			})
		if title_norm not in movie_data:
			movie_data[title_norm] = { \
				'Title': row['Title'], \
				'Release Year': row['Release Year'], \
				'Director': row['Director'], \
				'Writer': row['Writer'], \
				'LocationIds':[i] \
			}
		else:
			movie_data[title_norm]['LocationIds'].append(i)
		i = i + 1


# index.html is the main template for this app
@app.route('/')
@app.route('/index')
def index():
	return render_template('index.html')


# api routes:
# returns all movie titles in an array
@app.route('/api/titles')
def titles():
	return jsonify({'titles':[movie['Title'] for movie in movie_data.values()]})

# returns info for a given movie
@app.route('/api/movie/<title>')
def movie(title=None):
	movie = {}
	try:
		movie = movie_data[title]
	except KeyError:
		pass
	return jsonify(movie)

# returns info for all movies in the database
@app.route('/api/movies')
def allMovies():
	return jsonify(movie_data)

# returns all locations in the database
@app.route('/api/locations')
def getAllLocations():
	return jsonify({'locations':all_locations})

# returns all locations for a given movie
@app.route('/api/locations/<title>')
def getLocations(title=None):
	locations = []
	try:
		movie = movie_data[title]
		locations = [ all_locations[i] for i in movie['LocationIds'] ]
	except KeyError:
		pass
	return jsonify({'locations':locations})


if __name__ == '__main__':
	app.run(debug=False)