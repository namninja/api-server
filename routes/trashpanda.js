const TRASHPANDA_API_KEY = process.env.TRASHPANDA_API_KEY;


const trashpandaRoutes = (app, fs) => {
  app.post('/trashpanda', (req, res) => {
    const apiKey = req.headers['x-api-key'];

    // Check if the API key is present and valid
    if (req.headers['x-api-key'] !== TRASHPANDA_API_KEY) {
       console.warn("🛑 Unauthorized access attempt to /trashpanda");
  return res.status(401).send({ error: 'Unauthorized' });
}
    

    console.log("📬 Incoming Webhook Payload:");
    console.log(JSON.stringify(req.body, null, 2));

    fs.appendFile('./data/webhook-log.json', JSON.stringify(req.body) + '\n', err => {
      if (err) {
        console.error("❌ Failed to log webhook payload:", err);
      }
    });

    res.status(200).send({ status: 'received' });
  });
};

module.exports = trashpandaRoutes;