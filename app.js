var express = require('express');
var path = require('path');
// var hbs = require('express-handlebars')
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var session = require('express-session');
var owner = require('./routes/owner')
var restaurantRoutes = require('./routes/restaurants');
var indexRoutes = require('./routes/index');
//var ownerRoutes = require('./routes/owner');

var app = express();


// App configurations and settings.
app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({ extended: false }));
// Static folder
app.use(express.static('public'));
app.use(session({ secret: 'catkey', resave: false, saveUninitialized: false }));


app.use(bodyParser.urlencoded({ extended: false }));

app.use('/owner',owner);
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


app.set('view engine', 'hbs');

app.listen(process.env.PORT || 3000);

