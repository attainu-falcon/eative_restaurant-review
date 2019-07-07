'use strict';
var express = require('express');

var router = express.Router();

var mongo = require('mongodb');

var bodyParser = require('body-parser');

var session = require('express-session');

//Show all restaurants according to ratings
// router.get('/', function(request, response) {
// 	var DB = request.app.locals.DB;
// 	DB.collection('restaurants')
// 		.find()
// 		.toArray(function(err, restaurants) {
// 			if (err) {
// 				throw err;
// 			}
// 			restaurants.sort(function(a, b) {
// 				return a.avgRating - b.avgRating;
// 			});
// 			restaurants.reverse();
// 			var results = {
// 				restaurants: restaurants
// 			};

// 			console.log(restaurants);
// 			response.render('restaurants.hbs', results);
// 		});
// });

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


//Show single restaurant
router.get('/:_id', function(request, response) {
	if (!request.session.user) {
		return response.redirect('/login');
	}
	var mongoId = request.params._id;
	var Resdata = {};
	var db = request.app.locals.db;
	db.collection('restaurant').findOne(
		{ _id: mongo.ObjectID(mongoId) },
		function(error, data) {
			if (error) {
				response.send('Error: Not found');
				return;
			}

			Resdata.restaurant = data;
			Resdata.loggedInUser = request.session.user;

			// console.log(data);
		}
	);
	db.collection('comments')
		.find({ resId: mongoId })
		.toArray(function(err, result) {
			if (err) throw err;

			Resdata.commentAndRatings = result;

			response.render('restaurants-show.hbs', Resdata);
		});
});

//////////////////////////////////////////////////////
//comment and review routes
/////////////////////////////////////////////////////

router.post('/:mongoId', function(request, response) {
	var resId = request.params.mongoId;
	var avgRating;
	var db = request.app.locals.db;
	var data = {
		rating: request.body.rating,
		review: request.body.review,
		author: request.session.user.name,
		resId: resId
	};
	db.collection('comments').insertOne(data, function(error, dataInserted) {
		if (error) {
			response.send('error inserting data into DB');
			return;
		}
		response.redirect('/restaurants/' + resId);
	});

	db.collection('comments')
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
			db.collection('restaurants').updateOne(
				{ _id: mongo.ObjectID(resId) },
				{ $set: { avgRating: avgRating } }
			);
		});
});
module.exports = router;