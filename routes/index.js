'use strict';
var express = require('express');

var router = express.Router();

var mongo = require('mongodb');

var bodyParser = require('body-parser');

var session = require('express-session');

// App routes (URLs)
//main landing page with just logo
router.get('/', function(request, response) {
	response.render('landing.hbs');
});

// All authentication related code

router.get('/login', function(request, response) {
	response.render('login.hbs');
});

router.post('/login', function(request, response) {
	var db= request.app.locals.db;
	var user = {
		email: request.body.email,
		password: request.body.password
	};

	db.collection('users').findOne(user, function(error, user) {
		if (error || !user) {
			response.render('invalid-login.hbs');
			return;
		}

		request.session.user = true;
		response.redirect('/restaurants');
	});
});

router.get('/restaurants',function(request,response){
	var db = request.app.locals.db;
	if (request.session.user == true) {
	db.collection('restaurant').find().toArray(function(err, restaurants)
	 { 
		 if(err) 
		 {
			 throw err;
		}
		restaurants.sort(function(a, b){
			return a.avgRating-b.avgRating
		});
		restaurants.reverse();
		var results={
			restaurants : restaurants
		}
		response.render('restaurants',{
			data : restaurants
		});
	} ) } else {
		response.redirect('/login')
	}
})

router.get('/signup', function(request, response) {
	response.render('signup.hbs');
});

router.post('/signup', function(request, response) {
	var db = request.app.locals.db;
	var newUser = {
		name: request.body.name,
		email: request.body.email,
		password: request.body.password
	};

	db.collection('users').insertOne(newUser, function(error, data) {
		response.redirect('/login');
	});
});

router.get('/logout', function(request, response) {
	request.session.user = null;
	response.redirect('/login');
});

module.exports = router;
