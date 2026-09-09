const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const propertyDataPath = path.join(__dirname, '..', 'data', 'most_popular.json');
const imagesPath = path.join(__dirname, '..', 'public', 'images');

router.get('/getproperty', (req, res) => {
	try {
		const properties = JSON.parse(fs.readFileSync(propertyDataPath, 'utf8'));
		res.json(properties);
	} catch (error) {
		res.status(500).json({ error: 'Unable to load property data' });
	}
});

router.use('/images', express.static(imagesPath));

module.exports = router;
