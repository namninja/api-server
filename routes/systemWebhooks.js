const path = require('path');

const systemWebhooksRoutes = (app, fs) => {
  // Array to store webhook payloads temporarily (this will be replaced with client-side storage)
  let webhooks = [];

  // POST route to receive and store webhook payloads
  app.post('/systemwebhooks', (req, res) => {
    webhooks.unshift(req.body);
    console.log(req.body); // Log the payload for debugging
    res.status(201).send('Webhook received');
  });

  // Serve the HTML file when a GET request is made to /systemWebhooks
  app.get('/systemwebhooks', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/systemWebhooks.html'));
  });

  // API endpoint to return the stored webhook payloads as JSON
  app.get('/api/webhooks', (req, res) => {
    res.status(200).json(webhooks);
  });
};

module.exports = systemWebhooksRoutes;
