'use strict';
var express = require('express');

var router = express.Router();

var mongo = require('mongodb');

var bodyParser = require('body-parser');

var session = require('express-session');

//Dashboard for owner

router.get('/', function(request, response) {
	// Check if the user is logged in or not
	if (request.session.user) {
		// If the user is logged in, redirect her to home page
		response.redirect('/maaliks/home');
	} else {
		// If the user is not logged in, redirect her to login page
		response.redirect('/login');
	}
});

// // List all the restaurants of that owner
router.get('/home', function(request, response) {
	if (!request.session.user) {
		return response.redirect('/login');
	}

	var DB = request.app.locals.DB;
	DB.collection('restaurants')
		.find({ createdBy: request.session.user._id })
		.toArray(function(error, allRestaurants) {
			if (error) {
				response.send('Error fetching restaurants');
			} else {
				var data = {
					allRestaurants: allRestaurants,
					loggedInUser: request.session.user
				};
				response.render('maalik-index.hbs', data);
			}
		});
});

// Show add post form
router.get('/add', function(request, response) {
	if (!request.session.user) {
		return response.redirect('/login');
	}

	var DB = request.app.locals.DB;
	var data = {
		loggedInUser: request.session.user
	};

	if (request.query.success) {
		data.restaurantAdded = true;
	}

	response.render('maalik-add.hbs', data);
});

// Create a new post
router.post('/add', function(request, response) {
	if (!request.session.user) {
		return response.redirect('/login');
	}

	var DB = request.app.locals.DB;
	var data = {
		name: request.body.name,
		image: request.body.image,
		description: request.body.description,
		createdBy: request.session.user._id
	};

	// Insert the data in the DB.
	DB.collection('restaurants').insertOne(data, function(error, result) {
		if (error) {
			response.send('Error creating your restaurant');
			return;
		} else {
			response.redirect('/maaliks/add?success=true');
		}
	});
});

// Show edit form
router.get('/edit/:mongoId', function(request, response) {
	if (!request.session.user) {
		return response.redirect('/login');
	}

	var DB = request.app.locals.DB;
	var mongoId = request.params.mongoId;
	var editSuccess = request.query.success;

	DB.collection('restaurants').findOne(
		{ _id: mongo.ObjectID(mongoId) },
		function(error, data) {
			if (error) {
				response.send('Error: Not found');
				return;
			}

			if (data.createdBy != request.session.user._id) {
				return response.send('oh no! you are not allowed view this');
			}

			data.loggedInUser = request.session.user;

			if (editSuccess) {
				data.success = true;
			}

			response.render('maalik-edit.hbs', data);
		}
	);
});

// Update a blog post
router.post('/edit/:mongoId', function(request, response) {
	if (!request.session.user) {
		return response.redirect('/login');
	}

	var DB = request.app.locals.DB;
	var mongoId = request.params.mongoId;

	var newName = request.body.name;
	var newImage = request.body.image;
	var newDescription = request.body.description;

	DB.collection('restaurants').updateOne(
		{ _id: mongo.ObjectID(mongoId) }, // Filter an unique object
		{ $set: { name: newName, image: newImage, description: newDescription } }, // The new data to update
		function(error, data) {
			// The callback after update is done

			response.redirect('/maaliks/edit/' + mongoId + '?success=true');
		}
	);
});

// Deletes a post via JSON/AJAX
router.post('/delete/:mongoId', function(request, response) {
	if (!request.session.user) {
		return response.redirect('/login');
	}

	var DB = request.app.locals.DB;
	var mongoId = request.params.mongoId;

	DB.collection('restaurants').deleteOne(
		{ _id: mongo.ObjectID(mongoId) },
		function(error, status) {
			response.json({ deleted: true });
		}
	);
});
module.exports = router;
