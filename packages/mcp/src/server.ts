import { McpServer } from '@modelcontextprotocol/server';
import { createMcpHandler } from 'agents/mcp/server';
import {
  authenticateRequest,
  type McpAuthContext,
  protectedResourceMetadata
} from './auth';
import { registerCreatePlayerProfileTool } from './tools/create-player-profile';
import { registerCreateTransferTool } from './tools/create-transfer';
import { registerGetClubsTool } from './tools/get-clubs';
import { registerGetManagersTool } from './tools/get-managers';
import { registerGetMatchByDateTool } from './tools/get-match-by-date';
import { registerGetPlayersTool } from './tools/get-players';
import { registerGetTransfersTool } from './tools/get-transfers';
import { registerSearchResultsTool } from './tools/search-results';

function createServer(env: Env, auth: McpAuthContext) {
  const server = new McpServer({
    name: 'Tranmere-Web MCP',
    version: '1.0.0'
  });
  const context = { server, env, auth };

  registerGetPlayersTool(context);
  registerCreatePlayerProfileTool(context);
  registerGetMatchByDateTool(context);
  registerSearchResultsTool(context);
  registerCreateTransferTool(context);
  registerGetClubsTool(context);
  registerGetTransfersTool(context);
  registerGetManagersTool(context);

  return server;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (
      url.pathname === '/.well-known/oauth-protected-resource' ||
      url.pathname === '/.well-known/oauth-protected-resource/mcp'
    ) {
      return Response.json(protectedResourceMetadata(env), {
        headers: { 'Cache-Control': 'no-store' }
      });
    }

    if (url.pathname !== '/mcp') {
      return new Response('Not found', { status: 404 });
    }

    const message = await request
      .clone()
      .json<{
        method?: string;
        params?: { name?: string; arguments?: unknown };
      }>()
      .catch(() => null);
    const toolCall = message?.method === 'tools/call';
    if (toolCall) {
      console.log('MCP tool call', {
        tool: message.params?.name,
        arguments: message.params?.arguments
      });
    }

    const auth = await authenticateRequest(request, env);
    if (auth instanceof Response) return auth;

    const response = await createMcpHandler(() => createServer(env, auth))(
      request,
      env,
      ctx
    );
    if (toolCall) {
      console.log('MCP tool response', {
        status: response.status,
        body: (await response.clone().text()).slice(0, 8_000)
      });
    }
    return response;
  }
} satisfies ExportedHandler<Env>;
