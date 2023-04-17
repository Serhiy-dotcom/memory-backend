const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const User = require('../../models/User.js');
const Profile = require('../../models/Profile.js');

//@route    Post api/users
//@desc     Register user
//@access   Public
router.post(
	'/',
	[
		check('fullName', 'Full name is required!').not().isEmpty(),
		check('username', 'Username is required!'),
		check('email', 'Please include a valid email!').isEmail(),
		check(
			'password',
			'Please enter a password with 6 or more characters!'
		).isLength({ min: 6 }),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { fullName, email, password, username } = req.body;

		try {
			const userEmail = await User.findOne({ email: email });
			const userName = await User.findOne({ username: username });

			if (userEmail) {
				return res.status(409).send({
					errors: 'Email already exists!',
					field: 'email',
				});
			}

			if (userName) {
				return res.status(409).send({
					errors: 'Username already exists!',
					field: 'username',
				});
			}

			const user = new User({
				fullName,
				email,
				password,
				username,
			});

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);

			await user.save(function (err, room) {
				const profile = new Profile({
					user: room.id,
					avatar: room.avatar,
					username: username,
					fullName: room.fullName,
				});

				profile.save();
			});

			const payload = {
				user: {
					id: user.id,
				},
			};

			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{
					expiresIn: '240h',
				},
				(err, token) => {
					if (err) throw err;

					res.json({ token: token });
				}
			);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server error');
		}
	}
);

//@route	Post api/users/search
//@desc		Search users by their username
//@access	Private
router.post('/search', auth, async (req, res) => {
	try {
		//devide by space and check separately
		const searchTexts = req.body.searchText.split(' ');
		const users = await User.find().lean();

		if (searchTexts === []) {
			return res.json(users);
		}

		const searchedUsers = users.filter((user) => {
			const finded = searchTexts.filter((searchText) =>
				user.username.toLowerCase().includes(searchText.toLowerCase())
			);
			return finded.length > 0 ? true : false;
		});
		res.json(searchedUsers);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

module.exports = router;
