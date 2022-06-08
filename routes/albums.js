const albumRoutes = (app, fs) => {
    // variables
    const dataPath = './data/albums.json';
  
    // READ
    app.get('/albums', (req, res) => {
      fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
          throw err;
        }
  
        res.send(JSON.parse(data));
      });
    });
  };
  
  module.exports = albumRoutes;