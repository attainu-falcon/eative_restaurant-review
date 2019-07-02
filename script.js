var express = require('express');
var app = express();
// var mongoClient = require('mongodb').MongoClient;

// mongoClient.connect('mongodb://localhost:27017', function(err, client) {
//     if(err) {throw err; }
//     var db = client.db('eative');
//     db.collection('rest').find({}).toArray(function(err, result){
//         if(err) {throw err;}
        
//     })
//     });

app.use(express.static('public'));

app.get ('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/')
})


app.listen(process.env.PORT || 3000);
