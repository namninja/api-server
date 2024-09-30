const express = require('express'); // Add this line to import express
const path = require('path');
const userRoutes = require('./users');
const jobRoutes = require('./jobs');
const commentRoutes = require('./comments');
const postRoutes = require('./posts');
const todoRoutes = require('./todos');
const photoRoutes = require('./photos');
const albumRoutes = require('./albums');
const productRoutes = require('./products');
const cvjobRoutes = require('./cvjobs');
const jwtRoutes = require('./jwt');
const mobileJwtRoutes = require('./mobilejwt');
const programRoutes = require('./programs');
const testFeedRoutes = require('./testfeed');
const systemWebhooksRoutes = require('./systemWebhooks');

const appRouter = (app, fs) => {
  // Default route
  app.get('/', (req, res) => {
    res.send('welcome to the development api-server. Here are the following routes: users, comments, products, todos, photos, albums, posts');
  });

  app.use(express.static('public')); // Serve static files, including systemWebhooks.html


  // Wire up the routes
  userRoutes(app, fs);
  commentRoutes(app, fs);
  postRoutes(app, fs);
  todoRoutes(app, fs);
  photoRoutes(app, fs);
  albumRoutes(app, fs);
  productRoutes(app, fs);
  programRoutes(app, fs);
  jobRoutes(app, fs);
  cvjobRoutes(app, fs);
  jwtRoutes(app, fs);
  mobileJwtRoutes(app, fs);
  testFeedRoutes(app, fs);
  systemWebhooksRoutes(app, fs);
};

module.exports = appRouter;
