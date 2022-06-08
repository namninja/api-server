const commentRoutes = (app, fs) => {
    // variables
    const dataPath = './data/comments.json';
  
    // READ
    app.get('/comments', (req, res) => {
      fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
          throw err;
        }
  
        res.send(JSON.parse(data));
      });
    });
  };
  
  module.exports = commentRoutes;