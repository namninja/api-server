var jwt = require('jsonwebtoken');

const mobileJwtRoutes = (app, fs) => {
    // variables
  
    // READ
    app.post('/mobilejwt', (req, res) => {
        console.log(req)
        var token = jwt.sign({
            exp: 1719518228,
            iat: 1687982207, 
            email: req.body.email
        }, "80774a550ee940cb02cbf6598c942b733ac415cc43169fdde255d9229283046428d5da1b29e71d23d7880def66108a7d07a04fad8e35e47dd72e5a8e085a4a2a");
  
        res.status(201).json(token);
      });
    
  };
  
  module.exports = mobileJwtRoutes;