var jwt = require('jsonwebtoken');

const mobileJwtRoutes = (app, fs) => {
    // variables
  
    // READ
    app.post('/mobilejwt', (req, res) => {
        console.log(req)
        var time = (Math.floor(new Date().getTime() / 1000))
        console.log(time)
        var token = jwt.sign({
            exp: time + 120,
            iat: time, 
            email: req.body.email
        }, "80774a550ee940cb02cbf6598c942b733ac415cc43169fdde255d9229283046428d5da1b29e71d23d7880def66108a7d07a04fad8e35e47dd72e5a8e085a4a2a");
  
        res.status(201).json(token);
        //res.status(201).json({token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTMyNTQ0MzEsImVtYWlsIjoibmFtLm5nbytkcm9pZDRAaXRlcmFibGUuY29tIiwiaWF0IjoxNjg3OTgyMjA3fQ.YHOu1fweJI1F3OhA_tLQewxuSG5-Qv2O7iIhyTkSV-g"})
      });
    
  };
  
  module.exports = mobileJwtRoutes;