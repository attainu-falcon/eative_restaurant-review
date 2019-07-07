'use strict';

// Include all the packages/modules we need.
var express = require('express');
var mongo = require('mongodb');
var bodyParser = require('body-parser');
var session = require('express-session');

//for routers folder
var restaurantRoutes = require('./routes/restaurants');
var indexRoutes = require('./routes/index');
//var ownerRoutes = require('./routes/owner');

// Create the app
var app = express();

// App configurations and settings.
app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({ extended: false }));
// Static folder
app.use(express.static('public'));
app.use(session({ secret: 'catkey', resave: false, saveUninitialized: false }));

//for routers folder
app.use('/', indexRoutes);
app.use('/restaurants', restaurantRoutes);
//app.use('/owners', ownerRoutes);

// Create the DB connection
var DB;
var DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/eative';

// Create a Mongo client
var mongoClient = new mongo.MongoClient(DB_URL, { useNewUrlParser: true });
mongoClient.connect(function(error) {
	if (error) {
		console.log('Error connecting to the database.');
	} else {
		console.log('DB connection established.');
		DB = mongoClient.db('eative');
		app.locals.DB = DB;
	}
});

app.listen(process.env.PORT || 3000);
