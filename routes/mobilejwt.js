// Import the jsonwebtoken library for creating and signing JWTs
var jwt = require('jsonwebtoken');
// Define a function to add JWT-related routes to the Express app
const mobileJwtRoutes = (app, fs) => {
    // Set up a POST endpoint at /mobilejwt
    app.post('/mobilejwt', (req, res) => {
        // Log the incoming request object (for debugging)
        console.log(req);
        // Get the current Unix timestamp in seconds (JWTs use this for time-based claims)
        var time = Math.floor(new Date().getTime() / 1000);
        console.log(time); // Log the timestamp
        // Create a signed JWT token with:
        // - exp: expiration time (10 minutes from now)
        // - iat: issued at time (now)
        // - email: from the request body
        var token = jwt.sign({
            exp: time + 600,            // Token expires in 10 minutes (600 seconds)
            iat: time,                  // Token issued at current time
            email: req.body.email       // Embed user's email in the token
        }, 
        // Secret key used to sign the JWT — keep this secure and never expose it
        "0c811daa22858cdeb52eda1b7a0a1f3a5c1a8f5566a398869844504bf1a16f4043909c71cfad40790e0c971d04f5abb037c793cb11ffa2bff7b45da1dfdd4526");
        // Respond with HTTP status 201 (Created) and return the token in the response body
        res.status(201).json(token);
        // Alternate version (commented out): manually send a pre-generated token
        // res.status(201).json({token: "eyJhbGciOi..."})
    });
};
// Export this route definition so it can be used in other parts of the app
module.exports = mobileJwtRoutes;
