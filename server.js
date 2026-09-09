const express = require('express');
const path = require('path');
const propertyRouter = require('./routes/property');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', propertyRouter);

app.listen(3000, () => {
	console.log('Server running at http://localhost:3000');
});

module.exports = app;
