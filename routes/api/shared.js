const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth.js');
const { nanoid } = require('nanoid');
const fs = require('fs');

// api endpoint: https://api.publit.io
// api key: wW6S3Nt5a0SANR6p4M6z
// api secret: MgJy5zPtNe1WPAiizlmTbBa0eyyNH8T4
const PublitioAPI = require('publitio_js_sdk').default;
const publitio = new PublitioAPI('wW6S3Nt5a0SANR6p4M6z', 'MgJy5zPtNe1WPAiizlmTbBa0eyyNH8T4');

const path = require('path');

//@route	POST api/shared/host
//@desc		Host file for post
//@access	Private
router.post('/host/:type', auth, async (req, res) => {
	try {
		console.log(req);
		const filePath = path.join(
			__dirname + '\\temporaryFileStorage',
			`file.${req.params.type}`
		);
		const stream = fs.createWriteStream(filePath);
		stream.on('open', () => req.pipe(stream));
		const fileId = nanoid();

		stream.on('close', async () => {
			// Send a success response back to the client
			const file = fs.readFileSync(filePath);
			console.log(file);

			const hostedFile = await publitio.uploadFile(file, 'file');

			const url = hostedFile.url_preview;
			res.send(url);
		});

		stream.on('error', (err) => {
			console.error(err);
			res.status(500).send({ status: 'error', err });
		});
	} catch (err) {
		console.error(err);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
