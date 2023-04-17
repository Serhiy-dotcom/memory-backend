const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user',
	},
	avatar: {
		type: String,
	},
	fullName: {
		type: String,
	},
	username: {
		type: String,
	},
	posts: [
		{
			post: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'post',
			},
		},
	],
	followers: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'user',
			},
		},
	],
	following: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'user',
			},
		},
	],
	saved: [
		{
			post: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'post',
			},
		},
	],
	date: {
		type: Date,
		default: Date.now,
	},
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
