var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var Restaurant = require('./models/restaurant');
var Review = require('./models/review');
var Comment = require('./models/comment');

mongoose.connect('mongodb://localhost:27017/watever', {
	useNewUrlParser: true
});
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(
	session({
		secret: 'this is my secret'
	})
);

app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));

app.get('/', function(req, res) {
	res.render('landing');
});

app.get('/restaurants', function(req, res) {
	Restaurant.find({}, function(err, allRestaurants) {
		if (err) {
			console.log(err);
		} else {
			res.render('restaurants/index', { restaurants: allRestaurants });
		}
	});
});

app.post('/restaurants', function(req, res) {
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var newRestaurant = { name: name, image: image, description: desc };
	Restaurant.create(newRestaurant, function(err, newlyCreated) {
		if (err) {
			console.log(err);
		} else {
			res.redirect('/restaurants');
		}
	});
});

app.get('/restaurants/new', function(req, res) {
	res.render('restaurants/new.ejs');
});

app.get('/restaurants/:id', function(req, res) {
	Restaurant.findById(req.params.id)
		.populate('comments')
		.populate('reviews')
		.exec(function(err, foundRestaurant) {
			if (err) {
				console.log(err);
			} else {
				res.render('restaurants/show', { restaurant: foundRestaurant });
			}
		});
});

//////////////////////////////////////////////////////////////////////
// COMMENT ROUTES
/////////////////////////////////////////////////////////////////////

app.get('/restaurants/:id/comments/new', function(req, res) {
	Restaurant.findById(req.params.id, function(err, restaurant) {
		if (err) {
			console.log(err);
			res.redirect('/restaurants');
		} else {
			res.render('comments/new', { restaurant: restaurant });
		}
	});
});

app.post('/restaurants/:id/comments', function(req, res) {
	Restaurant.findById(req.params.id)
		.populate('comments')
		.exec(function(err, restaurant) {
			if (err) {
				console.log(err);
				res.redirect('/restaurants');
			}
			Comment.create(req.body.comment, function(err, comment) {
				if (err) {
					console.log(err);
					res.redirect('/restaurants');
				}

				comment.restaurant = restaurant;

				comment.save();
				restaurant.comments.push(comment);

				restaurant.save();

				res.redirect('/restaurants/' + restaurant._id);
			});
		});
});

app.get('/restaurants/:id/comments/:comment_id/edit', function(req, res) {
	Comment.findById(req.params.comment_id, function(err, foundComment) {
		if (err) {
			res.redirect('/restaurants/' + restaurant._id);
		} else {
			res.render('comments/edit', {
				restaurant_id: req.params.id,

				comment: foundComment
			});
		}
	});
});

app.put('/restaurants/:id/comments/:comment_id', function(req, res) {
	Comment.findByIdAndUpdate(
		req.params.comment_id,
		req.body.comment,
		{ new: true },
		function(err, updatedComment) {
			if (err) {
				res.redirect('/restaurants/' + restaurant._id);
			}
			Restaurant.findById(req.params.id)
				.populate('comments')
				.exec(function(err, restaurant) {
					if (err) {
						res.redirect('/restaurants/' + restaurant._id);
					}

					restaurant.save();

					res.redirect('/restaurants/' + restaurant._id);
				});
		}
	);
});

app.delete('/restaurants/:id/comments/:comment_id', function(req, res) {
	Comment.findByIdAndRemove(req.params.comment_id, function(err) {
		if (err) {
			res.redirect('/restaurants/' + restaurant._id);
		}
		Restaurant.findByIdAndUpdate(
			req.params.id,
			{ $pull: { comments: req.params.comment_id } },
			{ new: true }
		)
			.populate('comments')
			.exec(function(err, restaurant) {
				if (err) {
					res.redirect('/restaurants/' + restaurant._id);
				}

				restaurant.save();

				res.redirect('/restaurants/' + req.params.id);
			});
	});
});

/////////////////////////////////////////////////////////////////////////////////////////
//Review routes
///////////////////////////////////////////////////////////////////////////////////////////

app.get('/restaurants/:id/reviews/new', function(req, res) {
	Restaurant.findById(req.params.id, function(err, restaurant) {
		if (err) {
			console.log(err);
			res.redirect('/restaurants');
			// res.redirect('/restaurants/' + restaurant._id);
		} else {
			res.render('reviews/new', { restaurant: restaurant });
		}
	});
});

app.post('/restaurants/:id/reviews', function(req, res) {
	Restaurant.findById(req.params.id)
		.populate('reviews')
		.exec(function(err, restaurant) {
			if (err) {
				console.log(err);
				res.redirect('/restaurants');
				// res.redirect('/restaurants/' + restaurant._id);
			}
			Review.create(req.body.review, function(err, review) {
				if (err) {
					console.log(err);
					res.redirect('/restaurants');
					// res.redirect('/restaurants/' + restaurant._id);
				}
				review.restaurant = restaurant;
				//save review
				review.save();
				restaurant.reviews.push(review);

				restaurant.rating = calculateAverage(restaurant.reviews);

				function calculateAverage(reviews) {
					if (reviews.length === 0) {
						return 0;
					}
					var sum = 0;
					reviews.forEach(function(element) {
						sum += element.rating;
					});
					return sum / reviews.length;
				}
				restaurant.save();
				res.redirect('/restaurants/' + restaurant._id);
			});
		});
});

// Reviews Edit
app.get('/restaurants/:id/reviews/:review_id/edit', function(req, res) {
	Review.findById(req.params.review_id, function(err, foundReview) {
		if (err) {
			console.log(err);
			res.redirect('/restaurants/' + restaurant._id);
		} else {
			res.render('reviews/edit', {
				restaurant_id: req.params.id,
				review: foundReview
			});
		}
	});
});

// Reviews Update
app.put('/restaurants/:id/reviews/:review_id', function(req, res) {
	Review.findByIdAndUpdate(
		req.params.review_id,
		req.body.review,
		{ new: true },
		function(err, updatedReview) {
			if (err) {
				console.log(err);
				res.redirect('/restaurants/' + restaurant._id);
			}
			Restaurant.findById(req.params.id)
				.populate('reviews')
				.exec(function(err, restaurant) {
					if (err) {
						console.log(err);
						res.redirect('/restaurants/' + restaurant._id);
					}

					restaurant.rating = calculateAverage(restaurant.reviews);

					function calculateAverage(reviews) {
						if (reviews.length === 0) {
							return 0;
						}
						var sum = 0;
						reviews.forEach(function(element) {
							sum += element.rating;
						});
						return sum / reviews.length;
					}

					//save changes
					restaurant.save();

					res.redirect('/restaurants/' + restaurant._id);
				});
		}
	);
});

// Reviews Delete
app.delete('/restaurants/:id/reviews/:review_id', function(req, res) {
	Review.findByIdAndRemove(req.params.review_id, function(err) {
		if (err) {
			res.redirect('/restaurants/' + restaurant._id);
		}
		Restaurant.findByIdAndUpdate(
			req.params.id,
			{ $pull: { reviews: req.params.review_id } },
			{ new: true }
		)
			.populate('reviews')
			.exec(function(err, restaurant) {
				if (err) {
					console.log(err);
				}

				// recalculate  average
				restaurant.rating = calculateAverage(restaurant.reviews);
				function calculateAverage(reviews) {
					if (reviews.length === 0) {
						return 0;
					}
					var sum = 0;
					reviews.forEach(function(element) {
						sum += element.rating;
					});
					return sum / reviews.length;
				}
				//save changes
				restaurant.save();

				res.redirect('/restaurants/' + req.params.id);
			});
	});
});

app.get('/login', (req, res) => {
	res.render('login');
});
app.get('/register', (req, res) => {
	res.render('register');
});
app.get('/*', (req, res) => {
	res.send('<h1>INVALID REQUEST</h1>');
});

//server is running on port 3000
app.listen(5000);
