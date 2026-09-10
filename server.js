const express = require('express');
const path = require('path');
require('dotenv').config();
const propertyRouter = require('./routes/property');

const app = express();

app.use('/', propertyRouter);

// Provide the browser key only when map.js explicitly requests it.
app.get('/api/maps-key', (req, res) => {
	const key = process.env.GOOGLE_MAP_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

	if (!key) {
		return res.status(500).json({ error: 'Google Maps API key is not configured' });
	}

	return res.json({ key });
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => {
	console.log('Server running at http://localhost:3000');
});

module.exports = app;
