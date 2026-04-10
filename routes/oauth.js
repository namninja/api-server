const https = require('https');
const querystring = require('querystring');

const BASE_URL      = 'https://datafeed.reiterablecoffee.com';
const REDIRECT_URI  = `${BASE_URL}/oauth/callback`;

// App configs — keyed by the state param passed during auth
const APPS = {
  reddit: {
    client_id:      process.env.REDDIT_CLIENT_ID,
    client_secret:  process.env.REDDIT_CLIENT_SECRET,
    token_hostname: 'www.reddit.com',
    token_path:     '/api/v1/access_token'
  }
};

module.exports = (app, fs) => {

  // Initiate OAuth — visit /oauth/auth?app=reddit
  app.get('/oauth/auth', (req, res) => {
    const appName = req.query.app;
    const config  = APPS[appName];
    if (!config) return res.status(400).send(`Unknown app: ${appName}. Add it to APPS in oauth.js`);
    if (!config.client_id || !config.client_secret) {
      return res.status(503).send('OAuth not configured: set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET');
    }

    const params = querystring.stringify({
      client_id:     config.client_id,
      response_type: 'code',
      state:         appName,
      redirect_uri:  REDIRECT_URI,
      duration:      'permanent',
      scope:         'adsread adsedit'
    });

    res.redirect(`https://www.reddit.com/api/v1/authorize?${params}`);
  });

  // Universal callback — https://datafeed.reiterablecoffee.com/oauth/callback
  app.get('/oauth/callback', (req, res) => {
    const { code, state, error } = req.query;

    if (error || !code) {
      return res.status(400).send(`OAuth error: ${error || 'no code returned'}`);
    }

    const config = APPS[state];
    if (!config) return res.status(400).send(`Unknown state/app: ${state}`);
    if (!config.client_id || !config.client_secret) {
      return res.status(503).send('OAuth not configured: set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET');
    }

    const credentials = Buffer.from(`${config.client_id}:${config.client_secret}`).toString('base64');
    const postData = querystring.stringify({
      grant_type:   'authorization_code',
      code:         code,
      redirect_uri: REDIRECT_URI
    });

    const options = {
      hostname: config.token_hostname,
      path:     config.token_path,
      method:   'POST',
      headers: {
        'Authorization':  `Basic ${credentials}`,
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent':     'datafeed-oauth/1.0'
      }
    };

    const request = https.request(options, (response) => {
      let body = '';
      response.on('data', chunk => body += chunk);
      response.on('end', () => {
        try {
          const tokens = JSON.parse(body);
          if (tokens.error) {
            return res.status(400).send(`Error: ${tokens.error} — ${tokens.message || ''}`);
          }
          res.send(`
            <html><body style="font-family:monospace;padding:20px;background:#1a1a2e;color:#eee">
              <h2 style="color:#ff4500">${state} OAuth Tokens</h2>
              <p><b>Access Token</b> (expires in ${tokens.expires_in || 'N/A'}s):</p>
              <textarea rows="3" style="width:100%;background:#222;color:#0f0;padding:8px;font-size:12px">${tokens.access_token}</textarea>
              <p><b>Refresh Token</b> (permanent):</p>
              <textarea rows="3" style="width:100%;background:#222;color:#ff4500;padding:8px;font-size:12px">${tokens.refresh_token || 'N/A'}</textarea>
              <p><b>Scope:</b> ${tokens.scope || 'N/A'}</p>
              <p style="color:#888;font-size:11px">Save the refresh token then close this page.</p>
            </body></html>
          `);
        } catch (e) {
          res.status(500).send(`Failed to parse response: ${body}`);
        }
      });
    });

    request.on('error', err => res.status(500).send(`Request error: ${err.message}`));
    request.write(postData);
    request.end();
  });

};
