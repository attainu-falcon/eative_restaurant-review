require('dotenv').config()
var bodyparser = require('body-parser');
var express = require('express');
var multer = require('multer');
var session = require('express-session');
var router = express.Router();
var cloudinary = require('cloudinary').v2;

router.use(bodyparser.urlencoded(extended = true));

router.use(express.static('public'))

router.use(session({
    secret : 'secret'
}))

cloudinary.config({ 
    cloud_name : process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

var upload = multer({dest : 'public/images/'})


//login page served
router.get('/', function(req,res,next){
    res.render('login',{
        title : 'login'
    });
})

//signup page served
router.get('/signup', function(req,res,next){
    res.render('signup',{
        title : 'owner signup'
    });
})

// owner added to database
router.post('/auth',function(req,res){
    var db = req.app.locals.db;
    db.collection('owner').insertOne(req.body, function(err,result){
        if(err){
            throw err;
        }
    })
 res.redirect('/owner'); // after signup user redirected to loginpage to start a session
})

// owner logged in and session started
router.post('/login',function(req,res){
    var db = req.app.locals.db;
    db.collection('owner').findOne({email : req.body.email},function(err,result){
        if(req.body.email == result.email && req.body.password == result.password){
            req.session.login = true;
            MONGOID = result._id; // MONGO id stored for future references
        } res.redirect("/owner/panel");
        
    })
})

// after login page (here list of restaurants will be shown of same email id)
router.get('/panel',function(req,res){
    if(req.session.login == true){
        var db = req.app.locals.db;
        db.collection('restaurant').find({ OWNERID: MONGOID}).toArray(function(err,result){
        res.render('ownerlanding',{
            title : 'Your restaurants',
            data : result
        })
    })
    }
 else { res.redirect('/owner')}
})

// addrestaurant file served from ownerlanding page
router.get('/addrestaurant', function(req,res){
    if(req.session.login == true){
    res.render('addrestaurant',{
        title : 'Add a Restaurant'
    });
    } else {
        res.redirect('/owner')
    }
})

// this will add the restaurant to database
router.post('/uploadrestaurant', upload.single('uploadedfile'),function(req,res){
    var db = req.app.locals.db;
    db.collection('restaurant').insertOne(req.body, function(err,result){
            db.collection('restaurant').updateOne({ _id : require('mongodb').ObjectID(req.body._id) },{$set : {OWNERID : MONGOID}},function(err,result){
                 cloudinary.uploader.upload(req.file.path, function(error, result) {
                    db.collection('restaurant').updateOne({ _id : require('mongodb').ObjectID(req.body._id) },{$set : {imageurl : result.secure_url}},function(err,result){
                    if(err){
                         throw err;
            }   res.redirect('/owner/panel');
        })
    })
    }) 
 })
})

//particular restuarnt and its details will be shown
router.get('/restaurant/:_id',function(req,res,next){
    var db = req.app.locals.db;
    db.collection('restaurant').findOne({ _id : require('mongodb').ObjectID(req.params._id) },function(err,result){
        if (err){
            throw err;
        }
        res.render('restaurant',{
            title : result.restaurant ,
            data : result
        })
    })
})

// this will delete a particular restaurant from database
router.get('/delete/:_id',function(req,res){
    var db = req.app.locals.db;
    db.collection('restaurant').deleteOne({ _id : require('mongodb').ObjectID(req.params._id) },function(err,result){
        if (err){
            throw err;
        }
        res.redirect('/owner/panel')
     
    })
});

// this will redirect to edit page where details about restaurant will be changed
router.get('/editrestaurant/:_id',function(req,res){
    var db = req.app.locals.db;
    db.collection('restaurant').findOne({ _id : require('mongodb').ObjectID(req.params._id) },function(err,result){
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
router.post('/update',function(req,res){
    var db = req.app.locals.db;
    db.collection('restaurant').updateOne({ _id : require('mongodb').ObjectID(EDIT_ID) },{ $set : { address : req.body.address , reswebsite : req.body.reswebsite, restaurant : req.body.restaurant, resemail : req.body.resemail, description : req.body.description }},function(err,result){
        if (err){
            throw err;
        }
        res.redirect('back');
    })
});

// logout route for owners
router.get('/logout',function(req, res){
    req.session.destroy();
    res.redirect('/owner');
});

// for urls which are not available
router.get('/*',function(req,res){
    res.render("404",{
        title : 'page not found',
        style : '404'
    })
})

module.exports = router;