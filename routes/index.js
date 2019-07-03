'use strict';
var express = require('express');

var router = express.Router();

var mongo = require('mongodb');

var bodyParser = require('body-parser');

var session = require('express-session');

// App routes (URLs)
//main landing page with just logo
router.get('/', function(request, response) {
	response.render('landing.hbs');
});

module.exports = router;
