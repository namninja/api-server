const User = require('../data/posts.json')
const usersData = require('../data/users.json')

const postRoutesSensitive = (app, fs) => {
    // variables
    const dataPath = './data/posts.json';
  
    // READ - Sensitive route for testing failure handling in Iterable Datafeeds
    // Returns 400 when userId does not exist
    app.get('/posts-sensitive', (req, res) => {
      
      fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
          throw err;
        }
       
        if (!req.query || !req.query.userId) {
          res.send(JSON.parse(data));
        } else {
          const requestedUserId = req.query.userId;
          const userIdExists = usersData.users.some(u => String(u.id) === String(requestedUserId));
          
          if (!userIdExists) {
            res.status(400).json({
              error: 'Bad Request',
              message: `userId ${requestedUserId} does not exist`
            });
            return;
          }

          let filteredData = {
            "posts": User.posts.filter(function (obj) {
              return obj.userId == req.query.userId
            })
          }
          
          res.send(filteredData);
        }
        
      });
    });
  };
  
  module.exports = postRoutesSensitive;
