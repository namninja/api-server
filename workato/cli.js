#!/usr/bin/env node
/**
 * Workato CLI — used exclusively by the Cursor AI agent via Shell tool.
 * Not registered as an Express route. Not exposed publicly.
 *
 * Usage:
 *   node workato/cli.js <command> [args as JSON]
 *
 * Token management:
 *   node workato/cli.js add-token '{"project":"BetterHelp","env":"prod","token":"wrkaus-...","datacenter":"us"}'
 *   node workato/cli.js use '{"project":"BetterHelp","env":"prod"}'
 *   node workato/cli.js profiles
 *   node workato/cli.js whoami
 *
 * Recipes:
 *   node workato/cli.js recipes.list
 *   node workato/cli.js recipes.list '{"page":1,"per_page":100,"active":true}'
 *   node workato/cli.js recipes.get '{"id":72408852}'
 *   node workato/cli.js recipes.start '{"id":72408852}'
 *   node workato/cli.js recipes.stop '{"id":72408852}'
 *   node workato/cli.js recipes.getHealth '{"id":72408852}'
 *
 * Jobs:
 *   node workato/cli.js jobs.list '{"recipeId":72408852,"status":"failed","limit":50}'
 *   node workato/cli.js jobs.get '{"recipeId":72408852,"jobHandle":"abc123"}'
 *
 * Connections:
 *   node workato/cli.js connections.list
 *   node workato/cli.js connections.list '{"folder_id":12345}'
 *   node workato/cli.js connections.disconnect '{"id":456}'
 *
 * Environment:
 *   node workato/cli.js environment.getAuditLog '{"from":"2026-01-01","to":"2026-05-06"}'
 *   node workato/cli.js environment.listTags
 *
 * Folders/Projects:
 *   node workato/cli.js folders.list
 *   node workato/cli.js folders.listProjects
 *
 * Any client method:
 *   node workato/cli.js <namespace>.<method> '<json args object>'
 */

const cfg = require('./config');
const client = require('./client');

function print(data) {
  console.log(JSON.stringify(data, null, 2));
}

function err(msg, detail) {
  console.error(JSON.stringify({ error: msg, detail }, null, 2));
  process.exit(1);
}

async function run() {
  const [, , command, argsRaw] = process.argv;

  if (!command) {
    console.log(`
Workato CLI — AI-only access. Commands:

  Token management:
    add-token '{"project":"...","env":"...","token":"wrkaus-...","datacenter":"us"}'
    use '{"project":"...","env":"..."}'
    profiles
    whoami

  API calls (namespace.method):
    workspace.getMe
    recipes.list / recipes.get / recipes.start / recipes.stop / recipes.getHealth
    jobs.list / jobs.get
    connections.list / connections.disconnect / connections.update
    folders.list / folders.listProjects
    environment.getAuditLog / environment.listTags
    properties.list / properties.upsert
    collaborators.list
    apiPlatform.listCollections / apiPlatform.listEndpoints
    connectors.list / connectors.listAll
    dataTables.list / dataTables.queryRecords
    lookupTables.list / lookupTables.listRows
    agentStudio.listGenies / agentStudio.listSkills / agentStudio.listKnowledgeBases
    mcpServers.list / mcpServers.listTools
    testAutomation.runTestCases / testAutomation.getTestCases
    iam.listUsers / iam.listUserGroups
    ... and all other methods in client.js
    `);
    return;
  }

  let args = {};
  if (argsRaw) {
    try {
      args = JSON.parse(argsRaw);
    } catch {
      err('Invalid JSON args', argsRaw);
    }
  }

  // ── Token management commands ──────────────────────────────────────────────

  if (command === 'add-token') {
    const { project, env, token, datacenter = 'us' } = args;
    if (!project || !env || !token) {
      err('Required: project, env, token');
    }
    const key = cfg.addProfile(project, env, token, datacenter);
    print({ success: true, active: key, message: `Profile "${key}" saved and set as active.` });
    return;
  }

  if (command === 'use') {
    const { project, env } = args;
    if (!project || !env) err('Required: project, env');
    const profile = cfg.setActive(project, env);
    print({ success: true, active: `${project}:${env}`, profile });
    return;
  }

  if (command === 'profiles') {
    print(cfg.listProfiles());
    return;
  }

  if (command === 'remove-profile') {
    const { project, env } = args;
    if (!project || !env) err('Required: project, env');
    cfg.removeProfile(project, env);
    print({ success: true, removed: `${project}:${env}` });
    return;
  }

  if (command === 'whoami') {
    try {
      const profile = cfg.getActive();
      // Try /api/users/me first; fall back to recipes.list as a connectivity check
      // since some API clients are scoped and don't have users/me access.
      let workspaceInfo = null;
      try {
        const res = await client.workspace.getMe();
        workspaceInfo = res.body;
      } catch {
        const res = await client.recipes.list({ per_page: 1 });
        workspaceInfo = { note: '/api/users/me not in scope for this API client', connectivity: 'ok', sample: res.body };
      }
      print({ activeProfile: `${profile.project}:${profile.env}`, datacenter: profile.datacenter, baseUrl: profile.baseUrl, workspace: workspaceInfo });
    } catch (e) {
      err('whoami failed', e.message || e);
    }
    return;
  }

  // ── API call commands: namespace.method ────────────────────────────────────

  const parts = command.split('.');
  if (parts.length < 2) {
    err(`Unknown command: ${command}. Use namespace.method format (e.g. recipes.list)`);
  }

  const [namespace, method] = parts;
  const ns = client[namespace];

  if (!ns) {
    err(`Unknown namespace: "${namespace}"`, `Available: ${Object.keys(client).join(', ')}`);
  }
  if (typeof ns[method] !== 'function') {
    err(`Unknown method: "${method}" on ${namespace}`, `Available: ${Object.keys(ns).join(', ')}`);
  }

  // Map args object to positional parameters based on known signatures
  try {
    let result;

    // Recipes
    if (namespace === 'recipes') {
      if (method === 'list') result = await ns.list(args);
      else if (method === 'get') result = await ns.get(args.id);
      else if (method === 'create') result = await ns.create(args);
      else if (method === 'update') result = await ns.update(args.id, args.body || args);
      else if (method === 'delete') result = await ns.delete(args.id);
      else if (method === 'start') result = await ns.start(args.id);
      else if (method === 'stop') result = await ns.stop(args.id);
      else if (method === 'resetTrigger') result = await ns.resetTrigger(args.id);
      else if (method === 'updateConnection') result = await ns.updateConnection(args.id, args.body || args);
      else if (method === 'pollNow') result = await ns.pollNow(args.id);
      else if (method === 'getVersions') result = await ns.getVersions(args.id, args.params || {});
      else if (method === 'getVersion') result = await ns.getVersion(args.recipeId, args.versionId);
      else if (method === 'updateVersionComment') result = await ns.updateVersionComment(args.recipeId, args.versionId, args.body || args);
      else if (method === 'getHealth') result = await ns.getHealth(args.id);
      else if (method === 'analyzeHealth') result = await ns.analyzeHealth(args.id);
      else result = await ns[method](args);
    }

    // Jobs
    else if (namespace === 'jobs') {
      if (method === 'list') result = await ns.list(args.recipeId, args);
      else if (method === 'get') result = await ns.get(args.recipeId, args.jobHandle);
      else if (method === 'resume') result = await ns.resume(args);
      else if (method === 'repeat') result = await ns.repeat(args.recipeId, args.body || args);
      else result = await ns[method](args);
    }

    // Connections
    else if (namespace === 'connections') {
      if (method === 'list') result = await ns.list(args);
      else if (method === 'create') result = await ns.create(args);
      else if (method === 'update') result = await ns.update(args.id, args.body || args);
      else if (method === 'disconnect') result = await ns.disconnect(args.id);
      else if (method === 'delete') result = await ns.delete(args.id);
      else result = await ns[method](args);
    }

    // Folders
    else if (namespace === 'folders') {
      if (method === 'list') result = await ns.list(args);
      else if (method === 'listProjects') result = await ns.listProjects(args);
      else if (method === 'create') result = await ns.create(args);
      else if (method === 'updateFolder') result = await ns.updateFolder(args.id, args.body || args);
      else if (method === 'updateProject') result = await ns.updateProject(args.id, args.body || args);
      else if (method === 'deleteFolder') result = await ns.deleteFolder(args.id);
      else if (method === 'deleteProject') result = await ns.deleteProject(args.id);
      else result = await ns[method](args);
    }

    // Projects (build/deploy)
    else if (namespace === 'projects') {
      if (['build', 'deploy'].includes(method)) result = await ns[method](args.id, args.body || args);
      else if (method === 'getProjectBuild') result = await ns.getProjectBuild(args.id);
      else if (method === 'deployProjectBuild') result = await ns.deployProjectBuild(args.id, args.body || args);
      else if (method === 'getDeployment') result = await ns.getDeployment(args.id);
      else if (method === 'listDeployments') result = await ns.listDeployments(args);
      else if (method === 'listEligibleReviewers') result = await ns.listEligibleReviewers(args.id);
      else if (['assignReviewers', 'submitForReview', 'approveDeployment', 'rejectDeployment',
                'reopenDeployment', 'updateReviewComment', 'deployApproved'].includes(method))
        result = await ns[method](args.id, args.body || args);
      else result = await ns[method](args);
    }

    // Environment
    else if (namespace === 'environment') {
      if (method === 'getAuditLog') result = await ns.getAuditLog(args);
      else if (method === 'createTag') result = await ns.createTag(args);
      else if (method === 'updateTag') result = await ns.updateTag(args.handle, args.body || args);
      else if (method === 'deleteTag') result = await ns.deleteTag(args.handle);
      else result = await ns[method](args);
    }

    // Collaborators
    else if (namespace === 'collaborators') {
      if (['list', 'invite'].includes(method)) result = await ns[method](args);
      else if (['get', 'delete', 'listProjectGrants', 'getPrivileges', 'getProjectPrivileges'].includes(method))
        result = await ns[method](args.id);
      else if (method === 'update') result = await ns.update(args.id, args.body || args);
      else result = await ns[method](args);
    }

    // IAM
    else if (namespace === 'iam') {
      if (['listUsers', 'listUserGroups', 'listAppLinks'].includes(method)) result = await ns[method](args);
      else if (['getUser', 'deleteUser', 'listGroupMembers'].includes(method)) result = await ns[method](args.id || args.userId || args.groupId);
      else if (method === 'createUser' || method === 'createUserGroup' || method === 'createAppLink')
        result = await ns[method](args);
      else if (['updateUser', 'addUserToGroup', 'removeUserFromGroup'].includes(method))
        result = await ns[method](args.userId, args.body || args);
      else if (['updateUserGroup', 'addUsersToGroup', 'removeUsersFromGroup'].includes(method))
        result = await ns[method](args.groupId, args.body || args);
      else if (method === 'getUserGroup') result = await ns.getUserGroup(args.groupId);
      else if (method === 'deleteAppLink') result = await ns.deleteAppLink(args.id);
      else result = await ns[method](args);
    }

    // Data tables
    else if (namespace === 'dataTables') {
      if (['list', 'create'].includes(method)) result = await ns[method](args);
      else if (['get', 'delete', 'truncate'].includes(method)) result = await ns[method](args.id);
      else if (method === 'update') result = await ns.update(args.id, args.body || args);
      else if (method === 'queryRecords') result = await ns.queryRecords(args.tableId, args.body || args);
      else if (method === 'createRecord') result = await ns.createRecord(args.tableId, args.body || args);
      else if (method === 'updateRecord') result = await ns.updateRecord(args.tableId, args.recordId, args.body || args);
      else if (method === 'deleteRecord') result = await ns.deleteRecord(args.tableId, args.recordId);
      else result = await ns[method](args);
    }

    // Lookup tables
    else if (namespace === 'lookupTables') {
      if (['list', 'create'].includes(method)) result = await ns[method](args);
      else if (method === 'deleteBatch') result = await ns.deleteBatch(args);
      else if (method === 'lookup') result = await ns.lookup(args.tableId, args);
      else if (method === 'listRows') result = await ns.listRows(args.tableId, args);
      else if (method === 'getRow') result = await ns.getRow(args.tableId, args.rowId);
      else if (method === 'addRow') result = await ns.addRow(args.tableId, args.body || args);
      else if (method === 'updateRow') result = await ns.updateRow(args.tableId, args.rowId, args.body || args);
      else if (method === 'deleteRow') result = await ns.deleteRow(args.tableId, args.rowId);
      else result = await ns[method](args);
    }

    // Agent Studio
    else if (namespace === 'agentStudio') {
      if (['listGenies', 'listKnowledgeBases', 'listSkills'].includes(method)) result = await ns[method]();
      else if (['createGenie', 'createKnowledgeBase', 'createSkill'].includes(method)) result = await ns[method](args);
      else if (['getGenie', 'deleteGenie', 'startGenie', 'stopGenie',
                'getKnowledgeBase', 'deleteKnowledgeBase',
                'getKnowledgeBaseDataSources', 'getKnowledgeBaseRecipes', 'getSkill'].includes(method))
        result = await ns[method](args.id);
      else if (['updateGenie', 'updateKnowledgeBase',
                'assignSkillsToGenie', 'removeSkillsFromGenie',
                'assignKnowledgeBasesToGenie', 'removeKnowledgeBasesFromGenie',
                'assignUserGroupsToGenie', 'removeUserGroupsFromGenie'].includes(method))
        result = await ns[method](args.id, args.body || args);
      else result = await ns[method](args);
    }

    // MCP servers
    else if (namespace === 'mcpServers') {
      if (['list', 'listIdpUserGroups'].includes(method)) result = await ns[method]();
      else if (method === 'create') result = await ns.create(args);
      else if (['get', 'delete', 'renewToken', 'getServerPolicy', 'listTools'].includes(method))
        result = await ns[method](args.handle);
      else if (['update', 'assignTools', 'assignUserGroups', 'removeUserGroups',
                'moveToFolder', 'updateServerPolicy'].includes(method))
        result = await ns[method](args.handle, args.body || args);
      else if (method === 'updateToolDescription') result = await ns.updateToolDescription(args.handle, args.toolId, args.body || args);
      else if (method === 'deleteTool') result = await ns.deleteTool(args.handle, args.toolId);
      else result = await ns[method](args);
    }

    // API platform
    else if (namespace === 'apiPlatform') {
      if (['listCollections', 'listApiClients', 'listApiPortals'].includes(method)) result = await ns[method]();
      else if (method === 'createCollection' || method === 'createApiClient') result = await ns[method](args);
      else if (method === 'listEndpoints') result = await ns.listEndpoints(args);
      else if (method === 'enableEndpoint') result = await ns.enableEndpoint(args.id);
      else if (method === 'disableEndpoint') result = await ns.disableEndpoint(args.id);
      else if (method === 'getApiClient') result = await ns.getApiClient(args.id);
      else if (method === 'updateApiClient') result = await ns.updateApiClient(args.id, args.body || args);
      else if (method === 'deleteApiClient') result = await ns.deleteApiClient(args.id);
      else if (method === 'listApiKeys') result = await ns.listApiKeys(args.clientId);
      else if (method === 'createApiKey') result = await ns.createApiKey(args.clientId, args.body || args);
      else if (['updateApiKey', 'enableApiKey', 'disableApiKey', 'refreshApiKeySecret', 'deleteApiKey'].includes(method))
        result = await ns[method](args.clientId, args.keyId, args.body || args);
      else result = await ns[method](args);
    }

    // Test automation
    else if (namespace === 'testAutomation') {
      if (method === 'runTestCases') result = await ns.runTestCases(args);
      else if (method === 'getRunRequest') result = await ns.getRunRequest(args.id);
      else if (method === 'getTestCases') result = await ns.getTestCases(args.recipeId);
      else result = await ns[method](args);
    }

    // Lifecycle management
    else if (namespace === 'lifecycle') {
      if (method === 'getFolderAssets') result = await ns.getFolderAssets(args);
      else if (method === 'createManifest') result = await ns.createManifest(args);
      else if (['updateManifest', 'importPackage'].includes(method)) result = await ns[method](args.id, args.body || args);
      else if (['getManifest', 'deleteManifest', 'exportPackage', 'getPackage', 'downloadPackage'].includes(method))
        result = await ns[method](args.id || args.manifestId || args.folderId);
      else result = await ns[method](args);
    }

    // Fallback: call with args as first param
    else {
      result = await ns[method](args);
    }

    print(result);
  } catch (e) {
    if (e && e.status) {
      err(`API error ${e.status}`, e.body);
    } else {
      err(e.message || String(e), e.stack);
    }
  }
}

run();
