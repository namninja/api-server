var jwt = require('jsonwebtoken');

const mobileJwtRoutes = (app, fs) => {
    // variables
  
    // READ
    app.post('/mobilejwt', (req, res) => {
        console.log(req)
        var time = (Math.floor(new Date().getTime() / 1000))
        console.log(time)
        var token = jwt.sign({
            exp: time + 600,
            iat: time, 
            email: req.body.email
        }, "8bc52bc88ed097d4bbe28e54d58a35b7fe1d4531a9d1c2273fa0302a5e903674470364107cf878d80984d919d38814f0f0b0e6e04709858213ff8cfd6af0c0f9");
  
        res.status(201).json(token);
        //res.status(201).json({token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTMyNTQ0MzEsImVtYWlsIjoibmFtLm5nbytkcm9pZDRAaXRlcmFibGUuY29tIiwiaWF0IjoxNjg3OTgyMjA3fQ.YHOu1fweJI1F3OhA_tLQewxuSG5-Qv2O7iIhyTkSV-g"})
      });
    
  };
  
  module.exports = mobileJwtRoutes;