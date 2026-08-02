import { createMcpHandler } from 'agents/mcp/server';
import { createServer, publicReadAccess } from './server-factory';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === '/.well-known/openai-apps-challenge') {
      return new Response('bSgNO8kgIeXtO4EG6b5_VMwH2VfEiSNBIcgaOTL8cg4', {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=300'
        }
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
      console.log('Public MCP tool call', {
        tool: message.params?.name,
        arguments: message.params?.arguments
      });
    }

    const response = await createMcpHandler(() =>
      createServer(env, publicReadAccess, {
        includeWriteTools: false,
        name: 'Tranmere-Web Public MCP'
      })
    )(request, env, ctx);

    if (toolCall) {
      console.log('Public MCP tool response', {
        status: response.status,
        body: (await response.clone().text()).slice(0, 8_000)
      });
    }
    return response;
  }
} satisfies ExportedHandler<Env>;
