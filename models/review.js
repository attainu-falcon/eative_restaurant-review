var mongoose = require('mongoose');

var reviewSchema = new mongoose.Schema({
	rating: Number,
	author: String,
	restaurant: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Restaurant'
	}
});

module.exports = mongoose.model('Review', reviewSchema);
