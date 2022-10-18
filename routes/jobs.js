const jobRoutes = (app, fs) => {
    // variables
    const dataPath = './data/jobs.json';
  
    // READ
    app.get('/jobs', (req, res) => {
      fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
          throw err;
        }
  
        res.send(JSON.parse(data));
      });
    });
  };
  
  module.exports = jobRoutes;