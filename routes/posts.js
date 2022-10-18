const User = require('../data/posts.json')

const postRoutes = (app, fs) => {
    // variables
    const dataPath = './data/posts.json';
  
    // READ
    app.get('/posts', (req, res) => {
      
      fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
          throw err;
        }
       
        if (!req.query) {
          res.send(JSON.parse(data));
        } else {
          let filteredData = {
            "posts":User.posts.filter(function (obj) {
              return obj.userId == req.query.userId
            })
          }
          
          res.send(filteredData);
        }
        
      });
    });
  };
  
  module.exports = postRoutes;