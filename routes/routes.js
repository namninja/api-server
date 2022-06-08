// load up our shiny new route for users
const userRoutes = require('./users');
const commentRoutes = require('./comments');
const postRoutes = require('./posts');
const todoRoutes = require('./todos');
const photoRoutes = require('./photos');
const albumRoutes = require('./albums');
const productRoutes = require('./products');

const appRouter = (app, fs) => {
    // we've added in a default route here that handles empty routes
  // at the base API url
  app.get('/', (req, res) => {
    res.send('welcome to the development api-server');
  });

  // run our user route module here to complete the wire up
  userRoutes(app, fs);
  commentRoutes(app, fs);
  postRoutes(app, fs);
  todoRoutes(app, fs);
  photoRoutes(app, fs);
  albumRoutes(app, fs);
  productRoutes(app, fs);
};

module.exports = appRouter;