# MCP Server (createMcpHandler)

The simplest way to run a stateless MCP server on Cloudflare Workers. Uses `createMcpHandler` from the Agents SDK to handle all MCP protocol details in one line.

## What it demonstrates

- **`createMcpHandler`** — the Agents SDK helper that turns an `McpServer` factory into a Worker-compatible fetch handler
- **Minimal setup** — define tools in a factory, pass the factory to `createMcpHandler`, done
- **Stateless** — no Durable Objects, no persistent state, each request is independent

## Running

```sh
yarn --frozen-lockfile
yarn workspace @tranmere-web/mcp start
```

Open the browser to see the built-in tool tester, or connect with the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) at `http://localhost:5173/mcp`.

## Auth0 authentication

The production MCP endpoint is `https://mcp.tranmere-web.com/mcp`. It acts as
an OAuth protected resource and validates Auth0 RS256 access tokens.

Create an Auth0 API with:

- Identifier: `https://mcp.tranmere-web.com/mcp`
- Signing algorithm: `RS256`
- Token dialect: `rfc9068_profile_authz`
- Permissions:
  - `read:players`
  - `read:clubs`
  - `read:transfers`
  - `read:managers`
  - `read:matches`
  - `write:players`
  - `write:transfers`

Enable **Resource Parameter Compatibility Profile**, **Include Issuer in
Authorization Responses**, and **Client ID Metadata Document Registration** in
the Auth0 tenant settings. Assign the required API permissions to the Auth0
roles or users that should be allowed to connect.

The Worker publishes protected-resource metadata at:

```text
https://mcp.tranmere-web.com/.well-known/oauth-protected-resource
https://mcp.tranmere-web.com/.well-known/oauth-protected-resource/mcp
```

Unauthenticated calls to `/mcp` receive an RFC 9728 `WWW-Authenticate`
challenge. Individual tools also enforce their corresponding `read:*`
permission from the token's `permissions` or `scope` claim.

## Player UI

`GetPlayers` returns structured player data and links to the versioned MCP Apps
resource `ui://tranmere-web/players-v6.html`. Compatible clients render the
resource as a responsive player-card grid. The resource uses
`text/html;profile=mcp-app` and receives results through
`ui/notifications/tool-result`; ChatGPT's output-template alias is also
published for compatibility.

`CreatePlayerProfile` creates a new player record in D1 after checking for an
existing exact-name match. It requires the strict `write:players` Auth0
permission; unlike read tools, an unscoped audience token cannot create data.

`CreateTransfer` creates a transfer record using canonical club names from the
Clubs D1 table. It requires the strict `write:transfers` Auth0 permission,
checks that Tranmere Rovers is on exactly one side, and rejects an exact
duplicate.

## Match UI

`GetMatchByDate` accepts an exact date in `YYYY-MM-DD` format, derives the
football season, and retrieves the match from `api.tranmere-web.com`. It returns
the score, match details, goals, lineup, substitutes, and report excerpt as
structured data linked to `ui://tranmere-web/match-v5.html`. Compatible clients
render that resource as a responsive match card with a link to the full match
page and a programme cover when the archive has one. The server retains earlier
resource URIs as compatibility aliases for clients with cached tool metadata.

## Results search

`SearchResults` is a data-only tool that searches the existing results API by
season start year, exact opposition team name, or both. It returns up to 100
results by default in most-recent-first order and accepts an optional limit of
up to 500. It uses the existing `read:matches` permission.

## How it works

```typescript
import { McpServer } from '@modelcontextprotocol/server';
import { createMcpHandler } from 'agents/mcp/server';
import { z } from 'zod';

function createServer() {
  const server = new McpServer({ name: 'Hello MCP Server', version: '1.0.0' });
  server.registerTool(
    'hello',
    {
      description: 'Returns a greeting',
      inputSchema: { name: z.string().optional() }
    },
    async ({ name }) => ({
      content: [{ type: 'text', text: `Hello, ${name ?? 'World'}!` }]
    })
  );
  return server;
}

export default {
  fetch(request, env, ctx) {
    return createMcpHandler(createServer)(request, env, ctx);
  }
} satisfies ExportedHandler;
```

## Related examples

- [`mcp`](../mcp/) — stateful MCP server with `McpAgent` and Durable Objects
- [`mcp-worker-authenticated`](../mcp-worker-authenticated/) — adding OAuth authentication
- [`mcp-client`](../mcp-client/) — connecting to MCP servers as a client
