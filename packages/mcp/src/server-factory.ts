import { McpServer } from '@modelcontextprotocol/server';
import { MCP_SCOPES, type McpAuthContext } from './auth';
import { registerCreatePlayerProfileTool } from './tools/create-player-profile';
import { registerCreateTransferTool } from './tools/create-transfer';
import { registerGetClubsTool } from './tools/get-clubs';
import { registerGetManagersTool } from './tools/get-managers';
import { registerGetMatchByDateTool } from './tools/get-match-by-date';
import { registerGetPlayersTool } from './tools/get-players';
import { registerGetPlayersToolV2 } from './tools/get-players-v2';
import { registerGetTransfersTool } from './tools/get-transfers';
import { registerSearchResultsTool } from './tools/search-results';
import { registerUpdatePlayerProfileTool } from './tools/update-player-profile';

export type ServerAccess = McpAuthContext;

export const publicReadAccess: ServerAccess = {
  claims: {},
  permissions: new Set(
    MCP_SCOPES.filter((permission) => permission.startsWith('read:'))
  )
};

function registerReadTools(context: {
  server: McpServer;
  env: Env;
  auth: ServerAccess;
}) {
  registerGetMatchByDateTool(context);
  registerSearchResultsTool(context);
  registerGetClubsTool(context);
  registerGetTransfersTool(context);
  registerGetManagersTool(context);
}

function registerWriteTools(context: {
  server: McpServer;
  env: Env;
  auth: ServerAccess;
}) {
  registerCreatePlayerProfileTool(context);
  registerUpdatePlayerProfileTool(context);
  registerCreateTransferTool(context);
  registerGetPlayersToolV2(context);
}

export function createServer(
  env: Env,
  auth: ServerAccess,
  options: { includeWriteTools: boolean; name: string }
) {
  const server = new McpServer({
    name: options.name,
    version: '1.0.0'
  });
  const context = { server, env, auth };

  registerReadTools(context);
  if (options.includeWriteTools) {
    registerWriteTools(context);
    registerGetPlayersToolV2(context);
  } else {
    registerGetPlayersTool(context);
  }

  return server;
}
