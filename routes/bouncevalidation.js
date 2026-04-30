const VALID_TLDS = new Set([
  // Generic
  'com', 'net', 'org', 'edu', 'gov', 'mil', 'int',
  // Common new gTLDs
  'io', 'co', 'ai', 'app', 'dev', 'cloud', 'digital', 'email',
  'info', 'biz', 'name', 'pro', 'tech', 'online', 'site', 'store',
  'shop', 'media', 'agency', 'studio', 'group', 'team', 'blog',
  'news', 'health', 'finance', 'capital', 'consulting', 'solutions',
  'services', 'systems', 'network', 'software', 'support', 'marketing',
  'design', 'art', 'photography', 'video', 'music',
  // Country codes (common ones)
  'us', 'uk', 'ca', 'au', 'de', 'fr', 'es', 'it', 'nl', 'be',
  'ch', 'at', 'se', 'no', 'dk', 'fi', 'pl', 'pt', 'br', 'mx',
  'ar', 'cl', 'jp', 'cn', 'in', 'kr', 'sg', 'hk', 'nz', 'za',
  'ru', 'ua', 'cz', 'hu', 'ro', 'gr', 'tr', 'il', 'ae', 'sa',
  'ng', 'ke', 'eg', 'th', 'my', 'id', 'ph', 'vn', 'tw',
  // Common second-level + country combos resolved as single TLD tokens
  'me', 'tv', 'fm', 'am', 'to', 'cc', 'ws', 'mobi', 'tel',
]);

// Keys are misspelled domains; values are the likely intended domain
const ESP_MISSPELLINGS = {
  // Gmail
  'gmai.com':     'gmail.com',
  'gmal.com':     'gmail.com',
  'gmial.com':    'gmail.com',
  'gamil.com':    'gmail.com',
  'gmali.com':    'gmail.com',
  'gmaill.com':   'gmail.com',
  'gmails.com':   'gmail.com',
  'gemail.com':   'gmail.com',
  'gnail.com':    'gmail.com',
  'gail.com':     'gmail.com',
  'gmail.co':     'gmail.com',
  'gmail.cm':     'gmail.com',
  'gmail.con':    'gmail.com',
  'gmail.cmo':    'gmail.com',
  'gmailcom':     'gmail.com',
  'gmil.com':     'gmail.com',
  'gmeil.com':    'gmail.com',
  // Yahoo
  'yaho.com':     'yahoo.com',
  'yahooo.com':   'yahoo.com',
  'yhaoo.com':    'yahoo.com',
  'yhoo.com':     'yahoo.com',
  'yahou.com':    'yahoo.com',
  'yaho.co':      'yahoo.com',
  'yahoo.co':     'yahoo.com',
  'yahoo.cm':     'yahoo.com',
  'yahoo.con':    'yahoo.com',
  'yaho.net':     'yahoo.com',
  'ymail.co':     'ymail.com',
  // Hotmail
  'hotmal.com':   'hotmail.com',
  'hotmai.com':   'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotmial.com':  'hotmail.com',
  'hotmil.com':   'hotmail.com',
  'hotmail.co':   'hotmail.com',
  'hotmail.cm':   'hotmail.com',
  'hotmail.con':  'hotmail.com',
  'homail.com':   'hotmail.com',
  'htomail.com':  'hotmail.com',
  // Outlook
  'outlok.com':   'outlook.com',
  'outook.com':   'outlook.com',
  'outkook.com':  'outlook.com',
  'outlookk.com': 'outlook.com',
  'outllok.com':  'outlook.com',
  'outlook.co':   'outlook.com',
  'outlook.cm':   'outlook.com',
  'outlook.con':  'outlook.com',
  // iCloud
  'iclud.com':    'icloud.com',
  'icoud.com':    'icloud.com',
  'icolud.com':   'icloud.com',
  'icloud.co':    'icloud.com',
  'icoud.com':    'icloud.com',
  // AOL
  'aoll.com':     'aol.com',
  'ail.com':      'aol.com',
  'aol.co':       'aol.com',
  'aol.cm':       'aol.com',
  // Comcast / Xfinity
  'comcast.net':   null, // valid, keep for reference
  'comast.net':   'comcast.net',
  'comcasr.net':  'comcast.net',
  // MSN
  'msn.co':       'msn.com',
  // Live
  'live.co':      'live.com',
  'live.cm':      'live.com',
  'live.con':     'live.com',
};

// Remove entries with null (those are valid domains used as anchors above)
Object.keys(ESP_MISSPELLINGS).forEach(k => {
  if (ESP_MISSPELLINGS[k] === null) delete ESP_MISSPELLINGS[k];
});

const bounceValidationRoutes = (app) => {
  app.get('/bouncevalidation', (req, res) => {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        valid: false,
        email: 'missing',
        tld: 'missing',
        domain: 'missing',
        reason: 'Missing required query parameter: email',
        suggestion: 'missing'
      });
    }

    // Basic format check: must have exactly one @, non-empty local and domain parts
    const formatRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatRegex.test(email)) {
      return res.status(200).json({
        valid: false,
        email,
        reason: 'Invalid email format'
      });
    }

    const [, domain] = email.split('@');
    const parts = domain.split('.');
    const tld = parts[parts.length - 1].toLowerCase();

    if (!VALID_TLDS.has(tld)) {
      return res.status(200).json({
        valid: false,
        email,
        tld,
        reason: `Invalid or unrecognized TLD: .${tld}`
      });
    }

    const domainLower = domain.toLowerCase();
    const misspelling = ESP_MISSPELLINGS[domainLower];
    if (misspelling) {
      return res.status(200).json({
        valid: false,
        email,
        domain: domainLower,
        reason: `Likely misspelled email domain. Did you mean: ${misspelling}?`,
        suggestion: misspelling
      });
    }

    return res.status(200).json({
      valid: true,
      email,
      tld
    });
  });
};

module.exports = bounceValidationRoutes;
