const testFeedRoutes = (app, fs) => {
  // variables
  const dataPath = './data/testfeed.json';

  // READ
  app.get('/testfeed', (req, res) => {
    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      res.send(JSON.parse(data));
    });
  });
};

module.exports = testFeedRoutes;