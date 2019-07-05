var express = require('express');
var path = require('path');
var hbs = require('express-handlebars')
var mongoclient = require('mongodb').MongoClient;
var owner = require('./routes/owner')

var app = express();

app.use('/owner',owner);

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


app.engine('hbs', hbs({defaultLayout : "main", extname : "hbs"}));

app.set('view engine','hbs')

app.set('views',path.join(__dirname, 'views'));

app.listen(process.env.PORT || 3000);