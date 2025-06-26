// ./routes/trashpanda.js
const trashpandaRoutes = (app, fs) => {
  app.post('/trashpanda', (req, res) => {
    console.log("📬 Incoming Webhook Payload:");
    console.log(JSON.stringify(req.body, null, 2));

    // Append to log file
    fs.appendFile('./data/webhook-log.json', JSON.stringify(req.body) + '\n', err => {
      if (err) {
        console.error("❌ Failed to log webhook payload:", err);
      }
    });

    // Return 200 OK
    res.status(200).send({ status: 'received' });
  });
};

module.exports = trashpandaRoutes;