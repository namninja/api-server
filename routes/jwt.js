var jwt = require('jsonwebtoken');

const jwtRoutes = (app, fs) => {
    // variables
  
    // READ
    app.post('/jwt', (req, res) => {
        console.log(req)
        var token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + 31536000,
            iat: Math.floor(Date.now() / 1000), 
            email: req.body.email
        }, "cbe2c828bafc6bdea63ecc5784bd7c152b47da01af3bce280f23539f00bb56d6408c6f672abce383c20fa05e3d9129ced3c80845760a3ef9b72a8af2ab5f91a9");
  
        res.status(201).json(token);
      });
    
  };
  
  module.exports = jwtRoutes;

  