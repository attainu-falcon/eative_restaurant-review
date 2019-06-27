var express = require('express');
var session = require('express-session');
var bodyparser = require('body-parser');
var multer = require('multer');
var mongoclient = require('mongodb').MongoClient;

mongoclient.connect('mongodb://localhost:27017',function(err, client){
    if(err){
        throw err
    } 
    db = client.db('eative');
});

var app = express();

app.use(session({
    secret : 'secret'
}))

app.use(bodyparser.urlencoded(extended = true));

app.get('/', function(req,res){
    res.sendfile('login.html');
})

app.get('/signup', function(req,res){
    res.sendfile('signup.html');
})

app.post('/auth',function(req,res){

        db.collection('owner').insert(req.body, function(err,result){
            if(err){
                throw err;
            }
        })
     res.sendfile('ownerlanding.html')
})

app.get('/addrestaurant', function(req,res){
    res.sendfile('addrestaurant.html');
})


app.post('/login',function(req,res){
        db.collection('owner').findOne({email : req.body.email},function(err,result){
            if(req.body.email == result.email && req.body.password == result.password){
                req.session.login = true;
                req.session.email = req.body.email;
            } res.redirect("/panel")
            
        })
})


app.get('/panel',function(req,res){
        if(req.session.login == true){
            res.sendfile('ownerlanding.html')
            console.log(req.sessionID)
        }
     else { res.redirect('/')}
})

app.get('/cards',function(req,res){
    db.collection('restaurant').find({ email: req.session.email}).toArray(function(err,result){
        if (err){
            throw err;
        }
        console.log(result)
        res.send(result)
    })
})



// app.post('/addmenu',function(req,res){

//     var myquery = { email: req.session.email };
//     var newvalues = { $set: { req } };
//     db.collection('restaurant').updateOne(myquery, newvalues, function(err,result){
//         if(err){
//             throw err;
//         }
//     })
//  res.sendfile('addmenu.html')
// })

app.post('/addmenu',function(req,res){
    db.collection('restaurant').insertOne(req.body, function(err,result){
        if(err){
            throw err;
        }
    })
 res.redirect('/panel')
})

app.listen(3000);