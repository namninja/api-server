const programRoutes = (app, fs) => {
  // variables
  const dataPath = './data/programs.json';

  // READ
  app.get('/programs', (req, res) => {
    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      res.send(JSON.parse(data));
    });
  });
};

module.exports = programRoutes;