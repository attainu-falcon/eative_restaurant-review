var express = require('express');
var session = require('express-session');
var bodyparser = require('body-parser')
var db = require('./data/students.json');

var app = express();

app.use(session({              
    secret:"Express Session Secret!"
}));

app.use(bodyparser.urlencoded());

app.use(function(req, res, next){
    console.log("Session Id:"+ req.session.id);
    console.log(db[0]);
    console.log(req.body);
     next();
})

app.get('/',function(req,res){
    if(req.session.counter == undefined)
    {
        req.session.counter = 1;
        res.sendfile("Welcome to this page First Time");
    }
    else 
    {
        req.session.counter++;
    res.send("You visited to this page"  +  req.session.counter  +  "times");
    }
});
 
app.get('/login',function(req,res,){
    res.sendfile('public/index.html');
})

app.post('/auth',function(req,res){
         for(var i=0;i<db.length;i++)
         {
             if(req.body.email === db[i].email &&  req.body.password === db[i].password)
             {
                 req.session.login=true;
                 req.session.studentName = db[i].name;
               //  res.redirect('/user');
             }
         }
         res.redirect('/user');

});

app.get('/user',function(req, res){
    if(req.session.login == true)
    {
        res.send("Welcome"+ req.session.studentName + "Do u want to <a href= '/logout' >logout</a>?");
    }
    else{
        res.send("You are blocked");
    }
});
app.get('/logout', function(req, res){
     
    req.session.destroy();
    res.redirect('/login');
});

app.listen(3000);