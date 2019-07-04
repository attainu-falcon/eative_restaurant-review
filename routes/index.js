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
	var DB = request.app.locals.DB;
	var user = {
		email: request.body.email,
		password: request.body.password
	};

	DB.collection('users').findOne(user, function(error, user) {
		if (error || !user) {
			response.render('invalid-login.hbs');
			return;
		}

		request.session.user = user;
		response.redirect('/restaurants');
	});
});

router.get('/signup', function(request, response) {
	response.render('signup.hbs');
});

router.post('/signup', function(request, response) {
	var DB = request.app.locals.DB;
	var newUser = {
		name: request.body.name,
		email: request.body.email,
		password: request.body.password
	};

	DB.collection('users').insertOne(newUser, function(error, data) {
		response.redirect('/login');
	});
});

router.get('/logout', function(request, response) {
	request.session.user = null;
	response.redirect('/login');
});

module.exports = router;
