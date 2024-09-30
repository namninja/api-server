// Load up the express framework and body-parser helper
const express = require('express');
const bodyParser = require('body-parser');

// Create an instance of express
const app = express();

// File system for future use
const fs = require('fs');

// Configure express instance to handle JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Load the routes
const routes = require('./routes/routes.js')(app, fs); // Import the routes module

// Launch the server on a given port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
