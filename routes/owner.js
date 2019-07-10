'use strict';
var express = require('express');

var router = express.Router();

var mongo = require('mongodb');

var bodyParser = require('body-parser');

var session = require('express-session');

//this will show all the requests recieved
router.get('/', function(request, response) {
	if (!request.session.user) {
		return response.redirect('/login');
	}
	if (
		request.session.user.name !== 'Admin' ||
		request.session.user.password !== 'eative#36'
	) {
		return response.redirect('/login');
	}

	var DB = request.app.locals.DB;

	DB.collection('owners')
		.find({})
		.toArray(function(error, owners) {
			if (error) {
				console.log('error occured while connecting to restaurants collection');
			}

			var data = {
				owners: owners,
				loggedInUser: request.session.user
			};
			response.render('owner.hbs', data);
		});
});

//this will show the form to owners to add their restaurant details

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
	response.render('owner-add.hbs', data);
});
//this will add the requests recived to add the restaurants to the db
router.post('/add', function(request, response) {
	if (!request.session.user) {
		return response.redirect('/login');
	}
	var name = request.body.name;
	var city = request.body.city;
	var phone = request.body.phone;
	var email = request.body.email;

	var description = request.body.description;
	var DB = request.app.locals.DB;

	var newRestaurant = {
		name: name,
		city: city,
		phone: phone,
		email: email,

		description: description
	};

	DB.collection('owners').insertOne(newRestaurant, function(error, result) {
		if (error) {
			console.log(
				'error occured while inserting data into the restaurants collection'
			);
		}

		response.redirect('/owners/add?success=true');
	});
});
module.exports = router;
