/**
 * Workato token config — stores API tokens by project + environment.
 * Written/read by the AI via CLI. Not exposed as a public endpoint.
 *
 * Config file: api-server/workato/config.json
 * Format:
 * {
 *   "active": "betterhelp:prod",
 *   "profiles": {
 *     "betterhelp:prod": {
 *       "project": "BetterHelp",
 *       "env": "prod",
 *       "token": "wrkaus-...",
 *       "datacenter": "us",
 *       "added": "2026-05-06T..."
 *     }
 *   }
 * }
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'config.json');

const DATACENTER_URLS = {
  us: 'https://www.workato.com',
  eu: 'https://app.eu.workato.com',
  jp: 'https://app.jp.workato.com',
  sg: 'https://app.sg.workato.com',
  au: 'https://app.au.workato.com',
  il: 'https://app.il.workato.com',
  cn: 'https://app.workatoapp.cn',
  sandbox: 'https://app.trial.workato.com',
};

function load() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return { active: null, profiles: {} };
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function save(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function profileKey(project, env) {
  return `${project.toLowerCase()}:${env.toLowerCase()}`;
}

function addProfile(project, env, token, datacenter = 'us') {
  const config = load();
  const key = profileKey(project, env);
  config.profiles[key] = {
    project,
    env,
    token,
    datacenter,
    baseUrl: DATACENTER_URLS[datacenter] || DATACENTER_URLS.us,
    added: new Date().toISOString(),
  };
  config.active = key;
  save(config);
  return key;
}

function setActive(project, env) {
  const config = load();
  const key = profileKey(project, env);
  if (!config.profiles[key]) {
    throw new Error(`Profile "${key}" not found. Add it first with: node cli.js add-token`);
  }
  config.active = key;
  save(config);
  return config.profiles[key];
}

function getActive() {
  const config = load();
  if (!config.active || !config.profiles[config.active]) {
    throw new Error('No active Workato profile. Run: node cli.js add-token');
  }
  return config.profiles[config.active];
}

function listProfiles() {
  const config = load();
  return { active: config.active, profiles: config.profiles };
}

function removeProfile(project, env) {
  const config = load();
  const key = profileKey(project, env);
  delete config.profiles[key];
  if (config.active === key) {
    const remaining = Object.keys(config.profiles);
    config.active = remaining.length > 0 ? remaining[0] : null;
  }
  save(config);
}

module.exports = {
  load,
  save,
  addProfile,
  setActive,
  getActive,
  listProfiles,
  removeProfile,
  DATACENTER_URLS,
};
