/**
 * Workato API Client — wraps every documented Workato Developer API endpoint.
 * Uses the active profile from config.json for auth + base URL.
 * Not exposed publicly. Used internally by cli.js.
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const config = require('./config');

function request(method, path, body = null, overrideBaseUrl = null) {
  const profile = config.getActive();
  const baseUrl = overrideBaseUrl || profile.baseUrl;
  const url = new URL(path, baseUrl);

  return new Promise((resolve, reject) => {
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        Authorization: `Bearer ${profile.token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    const bodyStr = body ? JSON.stringify(body) : null;
    if (bodyStr) {
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (res.statusCode >= 400) {
            reject({ status: res.statusCode, body: parsed });
          } else {
            resolve({ status: res.statusCode, body: parsed });
          }
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function qs(params = {}) {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
  );
  const str = new URLSearchParams(filtered).toString();
  return str ? `?${str}` : '';
}

// ─── Workspace Details ────────────────────────────────────────────────────────

const workspace = {
  getMe: () => request('GET', '/api/users/me'),
};

// ─── Recipes ──────────────────────────────────────────────────────────────────

const recipes = {
  list: (params = {}) => request('GET', `/api/recipes${qs(params)}`),
  get: (id) => request('GET', `/api/recipes/${id}`),
  create: (body) => request('POST', '/api/recipes', body),
  copy: (body) => request('POST', '/api/recipes', body),
  update: (id, body) => request('PUT', `/api/recipes/${id}`, body),
  delete: (id) => request('DELETE', `/api/recipes/${id}`),
  start: (id) => request('PUT', `/api/recipes/${id}/start`),
  stop: (id) => request('PUT', `/api/recipes/${id}/stop`),
  resetTrigger: (id) => request('POST', `/api/recipes/${id}/reset_trigger`),
  updateConnection: (id, body) => request('PUT', `/api/recipes/${id}/connect`, body),
  pollNow: (id) => request('POST', `/api/recipes/${id}/poll_now`),
  getVersions: (id, params = {}) => request('GET', `/api/recipes/${id}/versions${qs(params)}`),
  getVersion: (recipeId, versionId) => request('GET', `/api/recipes/${recipeId}/versions/${versionId}`),
  updateVersionComment: (recipeId, versionId, body) => request('PUT', `/api/recipes/${recipeId}/versions/${versionId}`, body),
  getHealth: (id) => request('GET', `/api/recipes/${id}/health`),
  analyzeHealth: (id) => request('POST', `/api/recipes/${id}/health`),
};

// ─── Jobs ─────────────────────────────────────────────────────────────────────

const jobs = {
  list: (recipeId, params = {}) => request('GET', `/api/recipes/${recipeId}/jobs${qs(params)}`),
  get: (recipeId, jobHandle) => request('GET', `/api/recipes/${recipeId}/jobs/${jobHandle}`),
  resume: (body) => request('POST', '/api/job/resume', body),
  repeat: (recipeId, body) => request('POST', `/api/recipes/${recipeId}/repeat_jobs`, body),
};

// ─── Connections ──────────────────────────────────────────────────────────────

const connections = {
  list: (params = {}) => request('GET', `/api/connections${qs(params)}`),
  create: (body) => request('POST', '/api/connections', body),
  update: (id, body) => request('PUT', `/api/connections/${id}`, body),
  disconnect: (id) => request('POST', `/api/connections/${id}/disconnect`),
  delete: (id) => request('DELETE', `/api/connections/${id}`),
};

// ─── Folders & Projects ───────────────────────────────────────────────────────

const folders = {
  list: (params = {}) => request('GET', `/api/folders${qs(params)}`),
  listProjects: (params = {}) => request('GET', `/api/projects${qs(params)}`),
  create: (body) => request('POST', '/api/folders', body),
  updateFolder: (id, body) => request('PUT', `/api/folders/${id}`, body),
  updateProject: (id, body) => request('PUT', `/api/projects/${id}`, body),
  deleteFolder: (id) => request('DELETE', `/api/folders/${id}`),
  deleteProject: (id) => request('DELETE', `/api/projects/${id}`),
};

// ─── Projects (Build & Deploy) ────────────────────────────────────────────────

const projects = {
  build: (id, body) => request('POST', `/api/projects/${id}/build`, body),
  getProjectBuild: (id) => request('GET', `/api/project_builds/${id}`),
  deployProjectBuild: (id, body) => request('POST', `/api/project_builds/${id}/deploy`, body),
  deploy: (id, body) => request('POST', `/api/projects/${id}/deploy`, body),
  getDeployment: (id) => request('GET', `/api/deployments/${id}`),
  listDeployments: (params = {}) => request('GET', `/api/deployments${qs(params)}`),
  listEligibleReviewers: (id) => request('GET', `/api/deployments/${id}/eligible_reviewers`),
  assignReviewers: (id, body) => request('POST', `/api/deployments/${id}/assign_reviewers`, body),
  submitForReview: (id, body) => request('POST', `/api/deployments/${id}/submit_for_review`, body),
  approveDeployment: (id, body) => request('POST', `/api/deployments/${id}/approve`, body),
  rejectDeployment: (id, body) => request('POST', `/api/deployments/${id}/reject`, body),
  reopenDeployment: (id, body) => request('POST', `/api/deployments/${id}/reopen`, body),
  updateReviewComment: (id, body) => request('POST', `/api/deployments/${id}/update_review_comment`, body),
  deployApproved: (id, body) => request('POST', `/api/deployments/${id}/deploy`, body),
};

// ─── Project Grants ───────────────────────────────────────────────────────────

const projectGrants = {
  get: (id) => request('GET', `/api/project_grants/${id}`),
  update: (id, body) => request('PUT', `/api/project_grants/${id}`, body),
  delete: (id) => request('DELETE', `/api/project_grants/${id}`),
  listByProject: (projectId) => request('GET', `/api/projects/${projectId}/project_grants`),
  addToProject: (projectId, body) => request('PUT', `/api/projects/${projectId}/project_grants`, body),
};

// ─── Environment Management ───────────────────────────────────────────────────

const environment = {
  getAuditLog: (params = {}) => request('GET', `/api/activity_logs${qs(params)}`),
  clearSecretsCache: () => request('POST', '/api/secrets_management/clear_cache'),
  listTags: (params = {}) => request('GET', `/api/tags${qs(params)}`),
  createTag: (body) => request('POST', '/api/tags', body),
  updateTag: (handle, body) => request('PUT', `/api/tags/${handle}`, body),
  deleteTag: (handle) => request('DELETE', `/api/tags/${handle}`),
};

// ─── Environment Properties ───────────────────────────────────────────────────

const properties = {
  list: (params = {}) => request('GET', `/api/properties${qs(params)}`),
  upsert: (body) => request('POST', '/api/properties', body),
};

// ─── Environment Roles ────────────────────────────────────────────────────────

const environmentRoles = {
  list: () => request('GET', '/api/environment_roles'),
  get: (id) => request('GET', `/api/environment_roles/${id}`),
  create: (body) => request('POST', '/api/environment_roles', body),
  update: (id, body) => request('PUT', `/api/environment_roles/${id}`, body),
  delete: (id) => request('DELETE', `/api/environment_roles/${id}`),
};

// ─── Project Roles ────────────────────────────────────────────────────────────

const projectRoles = {
  list: () => request('GET', '/api/project_roles'),
  get: (id) => request('GET', `/api/project_roles/${id}`),
  create: (body) => request('POST', '/api/project_roles', body),
  update: (id, body) => request('PUT', `/api/project_roles/${id}`, body),
  delete: (id) => request('DELETE', `/api/project_roles/${id}`),
};

// ─── Legacy Roles ─────────────────────────────────────────────────────────────

const legacyRoles = {
  list: () => request('GET', '/api/roles'),
  update: (id, body) => request('PUT', `/api/roles/${id}`, body),
  copy: (id) => request('POST', `/api/roles/${id}/copy`),
};

// ─── Role Migration ───────────────────────────────────────────────────────────

const roleMigration = {
  migrateSystemRoles: (body) => request('POST', '/api/roles_migration/system_roles', body),
  migrateCustomRole: (body) => request('POST', '/api/roles_migration/custom_role', body),
};

// ─── Workspace Collaborators ──────────────────────────────────────────────────

const collaborators = {
  invite: (body) => request('POST', '/api/member_invitations', body),
  list: () => request('GET', '/api/members'),
  get: (id) => request('GET', `/api/members/${id}`),
  update: (id, body) => request('PUT', `/api/members/${id}`, body),
  delete: (id) => request('DELETE', `/api/members/${id}`),
  listProjectGrants: (id) => request('GET', `/api/members/${id}/project_grants`),
  getPrivileges: (id) => request('GET', `/api/members/${id}/privileges`),
  getProjectPrivileges: (id) => request('GET', `/api/members/${id}/projects_privileges`),
};

// ─── Collaborator Groups ──────────────────────────────────────────────────────

const collaboratorGroups = {
  list: () => request('GET', '/api/user_groups'),
  get: (id) => request('GET', `/api/user_groups/${id}`),
  create: (body) => request('POST', '/api/user_groups', body),
  update: (id, body) => request('PUT', `/api/user_groups/${id}`, body),
  delete: (id) => request('DELETE', `/api/user_groups/${id}`),
  listMembers: (id) => request('GET', `/api/user_groups/${id}/members`),
  addMembers: (id, body) => request('POST', `/api/user_groups/${id}/members`, body),
  removeMembers: (id, body) => request('DELETE', `/api/user_groups/${id}/members`, body),
  listProjectGrants: (id) => request('GET', `/api/user_groups/${id}/project_grants`),
};

// ─── API Clients (Developer) ──────────────────────────────────────────────────

const developerApiClients = {
  list: () => request('GET', '/api/developer_api_clients'),
  create: (body) => request('POST', '/api/developer_api_clients', body),
  get: (id) => request('GET', `/api/developer_api_clients/${id}`),
  update: (id, body) => request('PUT', `/api/developer_api_clients/${id}`, body),
  delete: (id) => request('DELETE', `/api/developer_api_clients/${id}`),
  regenerateToken: (id) => request('POST', `/api/developer_api_clients/${id}/regenerate`),
  listRoles: () => request('GET', '/api/developer_api_client_roles'),
};

// ─── API Platform ─────────────────────────────────────────────────────────────

const apiPlatform = {
  listCollections: () => request('GET', '/api/api_collections'),
  createCollection: (body) => request('POST', '/api/api_collections', body),
  listEndpoints: (params = {}) => request('GET', `/api/api_endpoints${qs(params)}`),
  enableEndpoint: (id) => request('PUT', `/api/api_endpoints/${id}/enable`),
  disableEndpoint: (id) => request('PUT', `/api/api_endpoints/${id}/disable`),
  // API clients (v2)
  listApiClients: () => request('GET', '/api/v2/api_clients'),
  createApiClient: (body) => request('POST', '/api/v2/api_clients', body),
  getApiClient: (id) => request('GET', `/api/v2/api_clients/${id}`),
  updateApiClient: (id, body) => request('PUT', `/api/v2/api_clients/${id}`, body),
  deleteApiClient: (id) => request('DELETE', `/api/v2/api_clients/${id}`),
  // API keys
  listApiKeys: (clientId) => request('GET', `/api/v2/api_clients/${clientId}/api_keys`),
  createApiKey: (clientId, body) => request('POST', `/api/v2/api_clients/${clientId}/api_keys`, body),
  updateApiKey: (clientId, keyId, body) => request('PUT', `/api/v2/api_clients/${clientId}/api_keys/${keyId}`, body),
  enableApiKey: (clientId, keyId) => request('PUT', `/api/v2/api_clients/${clientId}/api_keys/${keyId}/enable`),
  disableApiKey: (clientId, keyId) => request('PUT', `/api/v2/api_clients/${clientId}/api_keys/${keyId}/disable`),
  refreshApiKeySecret: (clientId, keyId) => request('PUT', `/api/v2/api_clients/${clientId}/api_keys/${keyId}/refresh_secret`),
  deleteApiKey: (clientId, keyId) => request('DELETE', `/api/v2/api_clients/${clientId}/api_keys/${keyId}`),
  listApiPortals: () => request('GET', '/api/v2/api_portals'),
};

// ─── Connectors ───────────────────────────────────────────────────────────────

const connectors = {
  list: (params = {}) => request('GET', `/api/integrations${qs(params)}`),
  listAll: (params = {}) => request('GET', `/api/integrations/all${qs(params)}`),
};

// ─── Custom Connectors ────────────────────────────────────────────────────────

const customConnectors = {
  list: (params = {}) => request('GET', `/api/custom_connectors${qs(params)}`),
  generateSchemaFromJson: (body) => request('POST', '/api/sdk/generate_schema/json', body),
  generateSchemaFromCsv: (body) => request('POST', '/api/sdk/generate_schema/csv', body),
};

// ─── Custom OAuth Profiles ────────────────────────────────────────────────────

const customOAuthProfiles = {
  list: () => request('GET', '/api/custom_oauth_profiles'),
  get: (id) => request('GET', `/api/custom_oauth_profiles/${id}`),
  create: (body) => request('POST', '/api/custom_oauth_profiles', body),
  update: (id, body) => request('PUT', `/api/custom_oauth_profiles/${id}`, body),
  delete: (id) => request('DELETE', `/api/custom_oauth_profiles/${id}`),
};

// ─── Data Tables ──────────────────────────────────────────────────────────────

const dataTables = {
  list: () => request('GET', '/api/data_tables'),
  get: (id) => request('GET', `/api/data_tables/${id}`),
  create: (body) => request('POST', '/api/data_tables', body),
  update: (id, body) => request('PUT', `/api/data_tables/${id}`, body),
  delete: (id) => request('DELETE', `/api/data_tables/${id}`),
  truncate: (id) => request('POST', `/api/data_tables/${id}/truncate`),
  // Record manipulation (different base URL)
  queryRecords: (tableId, body) => {
    const profile = config.getActive();
    const dtBase = profile.baseUrl.replace('www.workato.com', 'data-tables.workato.com')
      .replace('app.', 'data-tables.');
    return request('POST', `/api/v1/tables/${tableId}/query`, body, dtBase);
  },
  createRecord: (tableId, body) => {
    const profile = config.getActive();
    const dtBase = profile.baseUrl.replace('www.workato.com', 'data-tables.workato.com')
      .replace('app.', 'data-tables.');
    return request('POST', `/api/v1/tables/${tableId}/records`, body, dtBase);
  },
  updateRecord: (tableId, recordId, body) => {
    const profile = config.getActive();
    const dtBase = profile.baseUrl.replace('www.workato.com', 'data-tables.workato.com')
      .replace('app.', 'data-tables.');
    return request('PUT', `/api/v1/tables/${tableId}/records/${recordId}`, body, dtBase);
  },
  deleteRecord: (tableId, recordId) => {
    const profile = config.getActive();
    const dtBase = profile.baseUrl.replace('www.workato.com', 'data-tables.workato.com')
      .replace('app.', 'data-tables.');
    return request('DELETE', `/api/v1/tables/${tableId}/records/${recordId}`, null, dtBase);
  },
};

// ─── Lookup Tables ────────────────────────────────────────────────────────────

const lookupTables = {
  list: () => request('GET', '/api/lookup_tables'),
  create: (body) => request('POST', '/api/lookup_tables', body),
  deleteBatch: (body) => request('POST', '/api/lookup_tables/batch_delete', body),
  lookup: (tableId, params = {}) => request('GET', `/api/lookup_tables/${tableId}/lookup${qs(params)}`),
  listRows: (tableId, params = {}) => request('GET', `/api/lookup_tables/${tableId}/rows${qs(params)}`),
  getRow: (tableId, rowId) => request('GET', `/api/lookup_tables/${tableId}/rows/${rowId}`),
  addRow: (tableId, body) => request('POST', `/api/lookup_tables/${tableId}/rows`, body),
  updateRow: (tableId, rowId, body) => request('PUT', `/api/lookup_tables/${tableId}/rows/${rowId}`, body),
  deleteRow: (tableId, rowId) => request('DELETE', `/api/lookup_tables/${tableId}/rows/${rowId}`),
};

// ─── Event Streams ────────────────────────────────────────────────────────────

const eventStreams = {
  listTopics: () => request('GET', '/api/event_streams/topics'),
  createTopic: (body) => request('POST', '/api/event_streams/topics', body),
  getTopic: (id) => request('GET', `/api/event_streams/topics/${id}`),
  updateTopic: (id, body) => request('PUT', `/api/event_streams/topics/${id}`, body),
  purgeTopic: (id) => request('PUT', `/api/event_streams/topics/${id}/purge`),
  deleteTopic: (id) => request('DELETE', `/api/event_streams/topics/${id}`),
};

// ─── Agent Studio ─────────────────────────────────────────────────────────────

const agentStudio = {
  listGenies: () => request('GET', '/api/agentic/genies'),
  createGenie: (body) => request('POST', '/api/agentic/genies', body),
  getGenie: (id) => request('GET', `/api/agentic/genies/${id}`),
  updateGenie: (id, body) => request('PUT', `/api/agentic/genies/${id}`, body),
  deleteGenie: (id) => request('DELETE', `/api/agentic/genies/${id}`),
  startGenie: (id) => request('POST', `/api/agentic/genies/${id}/start`),
  stopGenie: (id) => request('POST', `/api/agentic/genies/${id}/stop`),
  assignSkillsToGenie: (id, body) => request('POST', `/api/agentic/genies/${id}/assign_skills`, body),
  removeSkillsFromGenie: (id, body) => request('POST', `/api/agentic/genies/${id}/remove_skills`, body),
  assignKnowledgeBasesToGenie: (id, body) => request('POST', `/api/agentic/genies/${id}/assign_knowledge_bases`, body),
  removeKnowledgeBasesFromGenie: (id, body) => request('POST', `/api/agentic/genies/${id}/remove_knowledge_bases`, body),
  assignUserGroupsToGenie: (id, body) => request('POST', `/api/agentic/genies/${id}/assign_user_groups`, body),
  removeUserGroupsFromGenie: (id, body) => request('POST', `/api/agentic/genies/${id}/remove_user_groups`, body),
  listKnowledgeBases: () => request('GET', '/api/agentic/knowledge_bases'),
  createKnowledgeBase: (body) => request('POST', '/api/agentic/knowledge_bases', body),
  getKnowledgeBase: (id) => request('GET', `/api/agentic/knowledge_bases/${id}`),
  updateKnowledgeBase: (id, body) => request('PUT', `/api/agentic/knowledge_bases/${id}`, body),
  deleteKnowledgeBase: (id) => request('DELETE', `/api/agentic/knowledge_bases/${id}`),
  getKnowledgeBaseDataSources: (id) => request('GET', `/api/agentic/knowledge_bases/${id}/data_sources`),
  getKnowledgeBaseRecipes: (id) => request('GET', `/api/agentic/knowledge_bases/${id}/recipes`),
  listSkills: () => request('GET', '/api/agentic/skills'),
  createSkill: (body) => request('POST', '/api/agentic/skills', body),
  getSkill: (id) => request('GET', `/api/agentic/skills/${id}`),
};

// ─── MCP Servers ──────────────────────────────────────────────────────────────

const mcpServers = {
  list: () => request('GET', '/api/mcp/mcp_servers'),
  create: (body) => request('POST', '/api/mcp/mcp_servers', body),
  get: (handle) => request('GET', `/api/mcp/mcp_servers/${handle}`),
  update: (handle, body) => request('PUT', `/api/mcp/mcp_servers/${handle}`, body),
  delete: (handle) => request('DELETE', `/api/mcp/mcp_servers/${handle}`),
  renewToken: (handle) => request('POST', `/api/mcp/mcp_servers/${handle}/token_renew`),
  assignTools: (handle, body) => request('POST', `/api/mcp/mcp_servers/${handle}/assign_tools`, body),
  assignUserGroups: (handle, body) => request('POST', `/api/mcp/mcp_servers/${handle}/assign_user_groups`, body),
  removeUserGroups: (handle, body) => request('POST', `/api/mcp/mcp_servers/${handle}/remove_user_groups`, body),
  moveToFolder: (handle, body) => request('PUT', `/api/mcp/mcp_servers/${handle}/update_folder`, body),
  getServerPolicy: (handle) => request('GET', `/api/mcp/mcp_servers/${handle}/server_policies`),
  updateServerPolicy: (handle, body) => request('PUT', `/api/mcp/mcp_servers/${handle}/server_policies`, body),
  listTools: (handle) => request('GET', `/api/mcp/mcp_servers/${handle}/tools`),
  updateToolDescription: (handle, toolId, body) => request('PUT', `/api/mcp/mcp_servers/${handle}/tools/${toolId}`, body),
  deleteTool: (handle, toolId) => request('DELETE', `/api/mcp/mcp_servers/${handle}/tools/${toolId}`),
  listIdpUserGroups: () => request('GET', '/api/mcp/user_groups'),
};

// ─── Recipe Lifecycle Management ──────────────────────────────────────────────

const lifecycle = {
  getFolderAssets: (params = {}) => request('GET', `/api/export_manifests/folder_assets${qs(params)}`),
  createManifest: (body) => request('POST', '/api/export_manifests', body),
  updateManifest: (id, body) => request('PUT', `/api/export_manifests/${id}`, body),
  getManifest: (id) => request('GET', `/api/export_manifests/${id}`),
  deleteManifest: (id) => request('DELETE', `/api/export_manifests/${id}`),
  exportPackage: (manifestId) => request('POST', `/api/packages/export/${manifestId}`),
  importPackage: (folderId, body) => request('POST', `/api/packages/import/${folderId}`, body),
  getPackage: (id) => request('GET', `/api/packages/${id}`),
  downloadPackage: (id) => request('GET', `/api/packages/${id}/download`),
};

// ─── Tag Assignments ──────────────────────────────────────────────────────────

const tags = {
  assign: (body) => request('POST', '/api/tags_assignments', body),
};

// ─── Test Automation ──────────────────────────────────────────────────────────

const testAutomation = {
  runTestCases: (body) => request('POST', '/api/test_cases/run_requests', body),
  getRunRequest: (id) => request('GET', `/api/test_cases/run_requests/${id}`),
  getTestCases: (recipeId) => request('GET', `/api/recipes/${recipeId}/test_cases`),
};

// ─── IAM / Workato Identity ───────────────────────────────────────────────────

const iam = {
  listUsers: (params = {}) => request('GET', `/api/iam/users${qs(params)}`),
  getUser: (userId) => request('GET', `/api/iam/users/${userId}`),
  createUser: (body) => request('POST', '/api/iam/users', body),
  updateUser: (userId, body) => request('PUT', `/api/iam/users/${userId}`, body),
  deleteUser: (userId) => request('DELETE', `/api/iam/users/${userId}`),
  addUserToGroup: (userId, body) => request('POST', `/api/iam/users/${userId}/add_to_group`, body),
  removeUserFromGroup: (userId, body) => request('POST', `/api/iam/users/${userId}/remove_from_group`, body),
  listUserGroups: (params = {}) => request('GET', `/api/iam/user_groups${qs(params)}`),
  getUserGroup: (groupId) => request('GET', `/api/iam/user_groups/${groupId}`),
  createUserGroup: (body) => request('POST', '/api/iam/user_groups', body),
  updateUserGroup: (groupId, body) => request('PUT', `/api/iam/user_groups/${groupId}`, body),
  deleteUserGroup: (groupId) => request('DELETE', `/api/iam/user_groups/${groupId}`),
  addUsersToGroup: (groupId, body) => request('POST', `/api/iam/user_groups/${groupId}/add_users`, body),
  removeUsersFromGroup: (groupId, body) => request('DELETE', `/api/iam/user_groups/${groupId}/remove_users`, body),
  listGroupMembers: (groupId) => request('GET', `/api/iam/user_groups/${groupId}/members`),
  listAppLinks: (params = {}) => request('GET', `/api/iam/app_links${qs(params)}`),
  createAppLink: (body) => request('POST', '/api/iam/app_links', body),
  deleteAppLink: (id) => request('DELETE', `/api/iam/app_links/${id}`),
  deleteAppLinks: (body) => request('DELETE', '/api/iam/app_links', body),
};

module.exports = {
  workspace,
  recipes,
  jobs,
  connections,
  folders,
  projects,
  projectGrants,
  environment,
  properties,
  environmentRoles,
  projectRoles,
  legacyRoles,
  roleMigration,
  collaborators,
  collaboratorGroups,
  developerApiClients,
  apiPlatform,
  connectors,
  customConnectors,
  customOAuthProfiles,
  dataTables,
  lookupTables,
  eventStreams,
  agentStudio,
  mcpServers,
  lifecycle,
  tags,
  testAutomation,
  iam,
};
