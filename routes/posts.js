const postRoutes = (app, fs) => {
    // variables
    const dataPath = './data/posts.json';
  
    // READ
    app.get('/posts', (req, res) => {
      fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
          throw err;
        }
  
        res.send(JSON.parse(data));
      });
    });
  };
  
  module.exports = postRoutes;