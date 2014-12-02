# imports
from flask import Flask, jsonify, render_template
import csv, json

app = Flask(__name__)

# load movie data
movie_data = {}
with open('sfmovies.csv') as csvfile:
	rdr = csv.DictReader(csvfile)
	for row in rdr:
		if row['Title'] not in movie_data:
			movie_data[row['Title']] = {
				'Title': row['Title'],
				'Release Year': row['Release Year'],
				'Director': row['Director'],
				'Writer': row['Writer'],
				'Locations':[{'Location':row['Locations'], 'Fun Facts':row['Fun Facts']}]
			}
		else:
			movie_data[row['Title']]['Locations'].append({'Location':row['Locations'], 'Fun Facts':row['Fun Facts']})


@app.route('/')
@app.route('/index')
def index():
	return render_template('index.html')

# returns info for all movies from the db
@app.route('/api/titles')
def all():
	return jsonify({'titles':movie_data.keys()})

# returns info for given movie
@app.route('/api/movie/<title>')
def movie(title=None):
	movie = {}
	try:
		movie = movie_data[title]
	except KeyError:
		pass
	return jsonify(movie)

if __name__ == '__main__':
	app.run(debug=True)