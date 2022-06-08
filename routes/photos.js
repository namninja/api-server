const photoRoutes = (app, fs) => {
    // variables
    const dataPath = './data/photos.json';
  
    // READ
    app.get('/photos', (req, res) => {
      fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
          throw err;
        }
  
        res.send(JSON.parse(data));
      });
    });
  };
  
  module.exports = photoRoutes;