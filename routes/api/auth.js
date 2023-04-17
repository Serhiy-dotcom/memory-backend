const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth.js');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User.js');
const Profile = require('../../models/Profile.js');

//@route    GET api/auth
//@desc     Test route
//@access   Public
router.get('/', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id })
			.select('-__v -_id -user')
			.lean();

		res.json({ _id: req.user.id, ...profile });
	} catch (err) {
		console.log(err.message);
		res.status(500).send('Server Error');
	}
});

//@route    POST api/auth
//@desc     Authenticate user
//@access   Public
router.post(
	'/',
	[
		check('email', 'Please include a valid email!').isEmail(),
		check('password', 'Password is required!').exists(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			let user = await User.findOne({ email: email });

			if (!user) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'Invalid Credentials!' }] });
			}

			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'Invalid Credentials!' }] });
			}

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

module.exports = router;
