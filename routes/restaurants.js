'use strict';
var express = require('express');

var router = express.Router();

var mongo = require('mongodb');

var bodyParser = require('body-parser');

var session = require('express-session');

//this will show the list of restaurants

router.get('/', function(request, response) {
	if (!request.session.user) {
		return response.redirect('/login');
	}

	var DB = request.app.locals.DB;

	DB.collection('restaurants')
		.find({})
		.sort({ avgRating: -1 })
		.toArray(function(error, restaurants) {
			if (error) {
				console.log('error occured while connecting to restaurants collection');
			}

			var data = {
				restaurants: restaurants,
				loggedInUser: request.session.user
			};
			response.render('restaurants.hbs', data);
		});
});

//this will show a form to add restaurants
router.get('/add', function(request, response) {
	var data = {};

	if (request.query.success) {
		data.restaurantAdded = true;
	}
	response.render('restaurants-add.hbs', data);
});

//this will save the form data into db and display that on /restaurants route

router.post('/add', function(request, response) {
	var name = request.body.name;
	var image = request.body.image;
	var description = request.body.description;
	var DB = request.app.locals.DB;

	var newRestaurant = {
		name: name,
		image: image,
		description: description
	};

	DB.collection('restaurants').insertOne(newRestaurant, function(
		error,
		result
	) {
		if (error) {
			console.log(
				'error occured while inserting data into the restaurants collection'
			);
		}

		response.redirect('/restaurants/add?success=true');
	});
});

//Show restuarant edit form
router.get('/edit/:mongoId', function(request, response) {
	var mongoId = request.params.mongoId;
	var avgRating;
	var DB = request.app.locals.DB;

	var editSuccess = request.query.success;

	DB.collection('restaurants').findOne(
		{ _id: mongo.ObjectID(mongoId) },
		function(error, data) {
			if (error) {
				response.send('Error: Not found');
				return;
			}

			if (editSuccess) {
				data.success = true;
			}

			response.render('restaurants-edit.hbs', data);
		}
	);
});

//Show single restaurant
router.get('/:mongoId', function(request, response) {
	if (!request.session.user) {
		return response.redirect('/login');
	}
	var mongoId = request.params.mongoId;
	var Resdata = {};
	var DB = request.app.locals.DB;
	DB.collection('restaurants').findOne(
		{ _id: mongo.ObjectID(mongoId) },
		function(error, data) {
			if (error) {
				response.send('Error: Not found');
				return;
			}

			Resdata.restaurant = data;
			Resdata.loggedInUser = request.session.user;

			console.log(data);
		}
	);
	DB.collection('comments')
		.find({ resId: mongoId })
		.toArray(function(err, result) {
			if (err) throw err;

			Resdata.commentAndRatings = result;

			response.render('restaurants-show.hbs', Resdata);
		});
});

//Update a restaurant data in db
router.post('/edit/:mongoId', function(request, response) {
	var mongoId = request.params.mongoId;
	var DB = request.app.locals.DB;
	var newName = request.body.name;
	var newImage = request.body.image;
	var newDescription = request.body.description;

	DB.collection('restaurants').updateOne(
		{ _id: mongo.ObjectID(mongoId) }, // Filter an unique object
		{ $set: { name: newName, image: newImage, description: newDescription } }, // The new data to update
		function(error, data) {
			// The callback after update is done

			response.redirect('/restaurants/edit/' + mongoId + '?success=true');
		}
	);
});

//Deletes a post via JSON/AJAX
router.post('/delete/:mongoId', function(request, response) {
	var mongoId = request.params.mongoId;
	var DB = request.app.locals.DB;

	DB.collection('restaurants').deleteOne(
		{ _id: mongo.ObjectID(mongoId) },
		function(error, status) {
			response.json({ deleted: true });
		}
	);
});

//////////////////////////////////////////////////////
//comment and review routes
/////////////////////////////////////////////////////

router.post('/:mongoId', function(request, response) {
	var resId = request.params.mongoId;
	var avgRating;
	var DB = request.app.locals.DB;
	var data = {
		rating: request.body.rating,
		review: request.body.review,
		author: request.session.user.name,
		resId: resId
	};
	DB.collection('comments').insertOne(data, function(error, dataInserted) {
		if (error) {
			response.send('error inserting data into DB');
			return;
		}
		response.redirect('/restaurants/' + resId);
	});

	DB.collection('comments')
		.find({ resId: resId })
		.toArray(function(err, result) {
			if (err) throw err;
			var ratingSum = 0;
			var len = result.length;
			for (var i = 0; i < len; i++) {
				ratingSum += parseInt(result[i].rating);
			}

			var data1 = {
				result: result
			};
			avgRating = parseInt(ratingSum / len);
			console.log(avgRating);
			DB.collection('restaurants').updateOne(
				{ _id: mongo.ObjectID(resId) },
				{ $set: { avgRating: avgRating } }
			);
		});
});
module.exports = router;
