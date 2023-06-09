var jwt = require('jsonwebtoken');

const jwtRoutes = (app, fs) => {
    // variables
    const dataPath = './data/jobs.json';
  
    // READ
    app.post('/jwt', (req, res) => {
        console.log(req)
        var token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + 31536000,
            iat: Math.floor(Date.now() / 1000), 
            email: req.body.email
        }, "8bc52bc88ed097d4bbe28e54d58a35b7fe1d4531a9d1c2273fa0302a5e903674470364107cf878d80984d919d38814f0f0b0e6e04709858213ff8cfd6af0c0f9");
  
        res.send(token);
      });
    
  };
  
  module.exports = jwtRoutes;