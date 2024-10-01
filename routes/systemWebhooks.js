const path = require('path');
const EventEmitter = require('events');

// Create an instance of EventEmitter
const webhookEmitter = new EventEmitter();
let clients = []; // Store connected clients

const systemWebhooksRoutes = (app, fs) => {
  let webhooks = [];

  // POST route to receive and store webhook payloads
  app.post('/systemwebhooks', (req, res) => {
    webhooks.unshift(req.body);
    console.log(req.body); // Log the payload for debugging
    webhookEmitter.emit('newWebhook', req.body); // Emit the event
    res.status(201).send('Webhook received');
  });

  // SSE endpoint to send updates to clients
  app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    clients.push(res); // Add the client response to the list

    // Remove the client from the list when the connection is closed
    req.on('close', () => {
      clients = clients.filter(client => client !== res);
    });
  });

  // Listen for new webhooks and notify connected clients
  webhookEmitter.on('newWebhook', (payload) => {
    clients.forEach(client => {
      client.write(`data: ${JSON.stringify(payload)}\n\n`); // Send new payload to each client
    });
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
