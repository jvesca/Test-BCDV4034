const express = require('express');
const app = express();
const cors = require('cors');

// To fix CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
app.use(cors());

// Parse JSON requests
app.use(express.json());

// Mock the routes for testing
app.use('/registration', require('./routes/registration'));
app.use('/donations', require('./routes/donations'));

module.exports = app;