require('dotenv').config()
var express = require('express');
var session = require('express-session');
var bodyparser = require('body-parser');
var multer = require('multer');
var path = require('path');
var cloudinary = require('cloudinary').v2;
var hbs = require('express-handlebars')
var mongoclient = require('mongodb').MongoClient;

var app = express();

// var DBURL;

// if(process.env.MY_DB)
//     DBURL = process.env.MY_DB
//  else
    DBURL = 'mongodb://localhost:27017';

mongoclient.connect(DBURL,function(err, client){
    if(err){
        throw err
    } 
    db = client.db('eative');
});
var upload = multer({dest : 'public/images/'})

cloudinary.config({ 
    cloud_name : process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

app.use(session({
    secret : 'secret'
}))

app.use(bodyparser.urlencoded(extended = true));

app.engine('hbs', hbs({defaultLayout : "main", extname : "hbs"}));

app.set('view engine','hbs')

app.set('views',path.join(__dirname, 'views'));

// Login file served 
app.get('/', function(req,res,next){
    res.sendfile('public/login.html');
})

// signup file served
app.get('/signup', function(req,res,next){
    res.sendfile('public/signup.html');
})

// owner added to database
app.post('/auth',function(req,res){

        db.collection('owner').insertOne(req.body, function(err,result){
            if(err){
                throw err;
            }
        })
     res.redirect('/'); // after signup user redirected to loginpage to start a session
})

// addrestaurant file served from ownerlanding page
app.get('/addrestaurant', function(req,res){
    if(req.session.login == true){
    res.render('addrestaurant',{
        title : 'Add a Restaurant'
    });
    } else {
        res.redirect('/')
    }
})

// login credentials matched 
app.post('/login',function(req,res){
        db.collection('owner').findOne({email : req.body.email},function(err,result){
            if(req.body.email == result.email && req.body.password == result.password){
                req.session.login = true;
                EMAILID = req.body.email;// email stored for future references
            } res.redirect("/panel")
            
        })
})

// after login page (here list of restaurants will be shown of same email id)
app.get('/panel',function(req,res){
        if(req.session.login == true){
            db.collection('restaurant').find({ email: EMAILID}).toArray(function(err,result){
            res.render('ownerlanding',{
                title : 'Your restaurants',
                data : result
            })
        })
        }
     else { res.redirect('/')}
})

// this will delete a particular restaurant from database
app.get('/delete/:_id',function(req,res){
    db.collection('restaurant').deleteOne({ _id : require('Mongodb').ObjectID(req.params._id) },function(err,result){
        if (err){
            throw err;
        }
        res.redirect('/panel')
     
    })
});

// this will redirect to edit page where details about restaurant will be changed
app.get('/editrestaurant/:_id',function(req,res){
    db.collection('restaurant').findOne({ _id : require('Mongodb').ObjectID(req.params._id) },function(err,result){
        if (err){
            throw err;
        }
        EDIT_ID = req.params._id;
        res.render('editpage',{
            title : 'Edit Restaurant',
            data : result
        })
    })
});

// this will update the restaurant
app.post('/update',function(req,res){
    db.collection('restaurant').updateOne({ _id : require('Mongodb').ObjectID(EDIT_ID) },{ $set : { address : req.body.address , reswebsite : req.body.reswebsite, restaurant : req.body.restaurant, resemail : req.body.resemail, description : req.body.description }},function(err,result){
        if (err){
            throw err;
        }
        res.redirect('back');
    })
});


// this will add the restaurant to database
app.post('/uploadphotos', upload.single('uploadedfile'),function(req,res){
    db.collection('restaurant').insertOne(req.body, function(err,result){
       ADDID = req.body._id;
            db.collection('restaurant').updateOne({ _id : require('Mongodb').ObjectID(ADDID) },{$set : {email : EMAILID}},function(err,result){
                 cloudinary.uploader.upload(req.file.path, function(error, result) {
                    db.collection('restaurant').updateOne({ _id : require('Mongodb').ObjectID(ADDID) },{$set : {imageurl : result.secure_url}},function(err,result){
                    if(err){
                         throw err;
            }   res.redirect('/panel');
        })
    })
    }) 
 })
})
// this will update image url in restaurant database
// app.post('/upload',upload.single('uploadedfile'),function(req,res){
//     cloudinary.uploader.upload(req.file.path, function(error, result) {
//         db.collection('restaurant').updateOne({ _id : require('Mongodb').ObjectID(ADDID) },{$set : {imageurl : result.secure_url}},function(err,result){
//             if(err){
//                 throw err;
//             }
//         })
//     });
//     res.redirect('/panel');
// })

app.get('/logout',function(req, res){
    req.session.destroy();
    res.redirect('/');
});

// for urls which are not available
app.get('/*',function(req,res){
    res.sendfile("public/404.html")
})

// app.use(express.static('public'))



app.listen(3000);