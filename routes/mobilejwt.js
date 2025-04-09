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
        }, "0c811daa22858cdeb52eda1b7a0a1f3a5c1a8f5566a398869844504bf1a16f4043909c71cfad40790e0c971d04f5abb037c793cb11ffa2bff7b45da1dfdd4526");
  
        res.status(201).json(token);
        //res.status(201).json({token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTMyNTQ0MzEsImVtYWlsIjoibmFtLm5nbytkcm9pZDRAaXRlcmFibGUuY29tIiwiaWF0IjoxNjg3OTgyMjA3fQ.YHOu1fweJI1F3OhA_tLQewxuSG5-Qv2O7iIhyTkSV-g"})
      });
    
  };
  
  module.exports = mobileJwtRoutes;