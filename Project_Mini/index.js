var express = require('express');
//var session = require('express-session');
var bodyparser = require('body-parser');
var mongoclient = require('mongodb').MongoClient;

var db;
mongoclient.connect('mongodb:\\localhost:27017',function(err,client){
    if(err) throw err;
    var db = client.db('school');
    console.log(db); 
});

var app = express();

//app.use(session({              
  //  secret:"Express Session Secret!"
//}));

app.use(bodyparser.urlencoded());

app.post('/signup',function(req,res){
    db.collection('school').insertOne(req.body, function(err,result){
     if(err) {
    throw err;
        }
    });
});


 app.post('/login',function(req,res){

 })
app.use(express.static('public'));

app.listen(3000);