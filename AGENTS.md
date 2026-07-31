# Agent Instructions

## Package Manager

- Use Yarn Classic with Node.js 24.
- Install dependencies: `yarn --frozen-lockfile`
- Run a workspace command: `yarn workspace <workspace-name> <script>`
- Start the site: `yarn site`
- Start the local API: `yarn api`

## File-Scoped Commands

| Task          | Command                                                            |
| ------------- | ------------------------------------------------------------------ |
| Lint a file   | `yarn workspace <workspace-name> eslint path/to/file.ts`           |
| Format a file | `yarn prettier --write path/to/file.ts`                            |
| Test API file | `yarn workspace @tranmere-web/api-stack test path/to/file.test.ts` |
| Typecheck MCP | `yarn workspace remote-mcp-server-authless type-check`             |

## Validation

- Run the narrowest relevant command before workspace-wide checks.
- Lint all workspaces: `yarn lint`
- Build the site: `yarn workspace @tranmere-web/site build`
- Test the API: `yarn workspace @tranmere-web/api-stack test`
- Synthesize infrastructure: `yarn workspace @tranmere-web/api-stack synth`


## Local Development

- A copy of the site can run locally by calling `yarn site` thsi runs the local website on `http://localhost:3001` aginst the productyion API.

## Project Structure

- See `docs/ARCHITECTURE.md` for system boundaries, data ownership, request flows, and deployment architecture.
- `packages/site/`: Next.js site and Cloudflare deployment
- `packages/api-stack/`: AWS CDK stack, Lambda handlers, and Jest tests
- `packages/lib/`: shared AWS and Contentful library
- `packages/tools/`: shared application tools
- `packages/mcp/`: Cloudflare MCP server and React app
- `packages/tidy/`, `packages/vectorize/`: Cloudflare workers
- `packages/sql/`: D1 schema and database commands
- Treat `cdk.out/`, `.next/`, `.open-next/`, and `.wrangler/` as generated output.

## Key Conventions

- Follow the nearest ESLint, Prettier, and TypeScript configuration.
- Keep workspace dependencies expressed with the existing `*` convention.
- Put reusable D1 entity types and shared SQL read queries in `packages/lib/`.
- Add tests under `packages/api-stack/test/` for API/CDK behavior.
- Do not run deploy or remote database commands unless explicitly requested.

## Commit Attribution

AI commits MUST include:

```text
Co-Authored-By: (the agent model's name and attribution byline)
```

Example: `Co-Authored-By: GPT-5 <noreply@openai.com>`
