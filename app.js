var express = require('express');
var path = require('path');
// var hbs = require('express-handlebars')
var bodyParser = require('body-parser');
var mongoclient = require('mongodb').MongoClient;
var session = require('express-session');
var owner = require('./routes/owner')
var restaurantRoutes = require('./routes/restaurants');
var indexRoutes = require('./routes/index');

var app = express();

app.use(express.static('public'));

app.use(session({ secret: 'catkey' }));

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/owner',owner);
app.use('/', indexRoutes);
app.use('/restaurants', restaurantRoutes);

var DBURL;

if(process.env.MY_DB)
    DBURL = process.env.MY_DB
 else
    DBURL = 'mongodb://localhost:27017';

mongoclient.connect(DBURL,function(err, client){
    if(err){
        throw err
    } ;
    app.locals.db = client.db('eative');
});


app.set('view engine', 'hbs');

app.listen(process.env.PORT || 3000);

