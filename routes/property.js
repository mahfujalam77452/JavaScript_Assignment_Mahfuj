const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const imagesPath = path.join(__dirname, '..', 'public', 'images');

const propertyDataFiles = {
	'most-popular': 'most_popular.json',
	'highest-price': 'highest_price.json',
	'lowest-price': 'lowest_price.json'
};

router.get('/get-property', (req, res) => {
	const mostPopular = req.query['most-popular'];
	const highestPrice = req.query['highest-price'];
	const lowestPrice = req.query['lowest-price'];
	const requestedLimit = req.query.limit;
	const dataset = mostPopular === 'true'
		? 'most-popular'
		: highestPrice === 'true'
			? 'highest-price'
			: lowestPrice === 'true'
				? 'lowest-price'
				: 'most-popular';
	const propertyDataPath = path.join(
		__dirname,
		'..',
		'data',
		propertyDataFiles[dataset]
	);

	try {
		// TODO: Property data is provided by the project owner; load it from data/*.json.
		const parsedFile = JSON.parse(fs.readFileSync(propertyDataPath, 'utf8'));
		const items = parsedFile?.Result?.Items;
		const properties = Array.isArray(items) ? items : [];
		const limit = Number(requestedLimit);
		const response = requestedLimit !== undefined
			&& Number.isInteger(limit)
			&& limit > 0
			? properties.slice(0, limit)
			: properties;

		res.status(200).json(response);
	} catch (error) {
		res.status(500).json({ error: 'Unable to load property data' });
	}
});

router.get('/images', (req, res) => {
    try {
        const imageFiles = fs.readdirSync(imagesPath, { withFileTypes: true })
            .filter(
                (entry) =>
                    entry.isFile() &&
                    /\.(jpg|jpeg|png|webp)$/i.test(entry.name)
            )
            .map(
                (entry) => `/images/${encodeURIComponent(entry.name)}`
            );

		if (imageFiles.length < 10) {
			console.warn(`Expected 10 property images, found ${imageFiles.length}`);
		}

        res.status(200).json(imageFiles);
    } catch (error) {
        res.status(500).json({ error: 'Unable to load images' });
    }
});

router.use('/images', express.static(imagesPath));

module.exports = router;
