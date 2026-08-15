# Tranmere-Web

[![CodeQL](https://github.com/chrisowen491/tranmere-web/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/chrisowen491/tranmere-web/actions/workflows/codeql-analysis.yml)
[![Web Deploy](https://github.com/chrisowen491/tranmere-web/actions/workflows/web.yml/badge.svg)](https://github.com/chrisowen491/tranmere-web/actions/workflows/web.yml)

[Tranmere-Web](https://www.tranmere-web.com) is an independent, non-commercial
archive of Tranmere Rovers history. It covers players, matches, results,
seasons, managers, transfers, shirts, programmes and supporter-built archive
features.

## Architecture

The website is a TypeScript Yarn Classic monorepo running on Cloudflare:

- `packages/site` is the Next.js site, deployed with OpenNext as a Cloudflare
  Worker.
- Cloudflare D1 is the primary application database for football data,
  administration, corrections, comments, ratings and programme records.
- Cloudflare Email Sending delivers contact-form messages to the configured
  `AUTH0_ADMIN_EMAIL` recipient.
- Contentful remains the editorial CMS. Site search uses a materialized D1
  index with SQLite FTS5 across players, clubs and seasons.
- Cloudflare Workers host the MCP services and scheduled summary rebuilds.

The only remaining AWS-backed API capability is the legacy GraphQL endpoint.
It is retained temporarily for compatibility and is planned for removal; new
site and service work must use D1 rather than adding REST or Lambda API calls.

Read [the architecture guide](docs/ARCHITECTURE.md) for system boundaries and
data ownership, and [the feature catalogue](docs/FEATURES.md) for the current
site capabilities.

## Local development

Prerequisites:

- Node.js 24
- Yarn Classic

Install dependencies:

```bash
yarn --frozen-lockfile
```

Run the site locally at <http://localhost:3001>:

```bash
yarn site
```

Useful validation commands:

```bash
yarn lint
yarn workspace @tranmere-web/site test
yarn workspace @tranmere-web/site build
```

## Repository guide

| Workspace                 | Responsibility                                                    |
| ------------------------- | ----------------------------------------------------------------- |
| `packages/site`           | Public site, internal route handlers and admin UI                 |
| `packages/lib`            | Shared domain types, D1 types and reusable SQL reads              |
| `packages/sql`            | D1 schema, migrations, imports and database commands              |
| `packages/mcp`            | Public and Auth0-protected Cloudflare MCP servers and MCP Apps UI |
| `packages/scheduled-task` | Daily D1 summary, milestone and site-search index worker          |
| `packages/api-stack`      | Temporary legacy GraphQL infrastructure pending removal           |

Do not run remote database or deployment commands unless the change has been
explicitly approved. See [AGENTS.md](AGENTS.md) for contributor conventions.
