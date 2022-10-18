const jobRecommendationRoutes = (app, fs) => {
    // variables
    const dataPath = './data/job-recomendations.json';
  
    // READ
    app.get('/job-recommendations', (req, res) => {
      fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
          throw err;
        }
  
        res.send(JSON.parse(data));
      });
    });
  };
  
  module.exports = jobRecommendationRoutes;