const User = require('../data/cvjobs.json')

const cvjobRoutes = (app, fs) => {
    // variables
    const dataPath = './data/cvjobs.json';
  
    // READ
    app.get('/cvjobs', (req, res) => {
      
      fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
          throw err;
        }
       
        if (!req.query) {
          res.send(JSON.parse(data));
        } else {
          let filteredData = {
            "jobs":User.jobs.filter(function (obj) {
              return obj.userId == req.query.userId
            })
          }
          
          res.send(filteredData);
        }
        
      });
    });
  };
  
  module.exports = cvjobRoutes;