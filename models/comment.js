var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
	text: String,
	author: String,
	restaurant: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Restaurant'
	}
});

module.exports = mongoose.model('Comment', commentSchema);
