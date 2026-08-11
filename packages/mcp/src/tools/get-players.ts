import {
  countPlayerRows,
  queryPlayerRows
} from '@tranmere-web/lib/src/d1-queries';
import type { PlayerRow } from '@tranmere-web/lib/src/d1-types';
import { z } from 'zod';
import { permissionDenied } from '../auth';
import { PLAYERS_UI_URI, playersWidgetHtml } from '../player-widget';
import type { ToolContext } from './context';

type McpPlayerRow = Pick<
  PlayerRow,
  | 'id'
  | 'name'
  | 'date_of_birth'
  | 'biography_markdown'
  | 'pic_link'
  | 'foot'
  | 'height'
  | 'place_of_birth'
  | 'position'
>;

const inputSchema = z.object({
  query: z
    .string()
    .trim()
    .optional()
    .describe('Optionally filter players by name'),
  sort: z
    .enum(['name', 'oldest-updated'])
    .optional()
    .describe(
      'Sort by name (default), or use oldest-updated to prioritise profiles with no update timestamp and then the oldest updated profiles.'
    ),
  page: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      'Page number to return, beginning at 1. Each page contains 30 players.'
    )
});

const outputSchema = z.object({
  count: z.number().int().nonnegative(),
  totalCount: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.literal(30),
  totalPages: z.number().int().nonnegative(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
  players: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      dateOfBirth: z.string().nullable(),
      biographyMarkdown: z.string().nullable(),
      picLink: z.string().nullable(),
      foot: z.string().nullable(),
      height: z.string().nullable(),
      placeOfBirth: z.string().nullable(),
      position: z.string().nullable()
    })
  )
});

export function registerGetPlayersTool({ server, env, auth }: ToolContext) {
  const playerUiUris = [
    'ui://tranmere-web/players-v4.html',
    'ui://tranmere-web/players-v5.html',
    'ui://tranmere-web/players-v6.html',
    'ui://tranmere-web/players-v7.html',
    PLAYERS_UI_URI
  ];
  playerUiUris.forEach((uri, index) =>
    server.registerResource(`players-ui-v${index + 4}`, uri, {}, async () => ({
      contents: [
        {
          uri,
          mimeType: 'text/html;profile=mcp-app',
          text: playersWidgetHtml,
          _meta: {
            ui: {
              prefersBorder: false,
              domain: env.MCP_WIDGET_DOMAIN,
              csp: {
                connectDomains: [],
                resourceDomains: [
                  'https://www.tranmere-web.com',
                  'https://images.ctfassets.net'
                ]
              }
            }
          }
        }
      ]
    }))
  );

  server.registerTool(
    'GetPlayers',
    {
      description:
        'Search the TranmereWeb database of Tranmere Rovers player profiles. Use this to find a player, check whether a profile already exists before creating or updating one, or retrieve profile facts such as biography, position, birth details and avatar URL. Results are paginated in fixed groups of 30: use page 1 by default, then increase page to browse further. Use sort oldest-updated to prioritise profiles that have never been updated, followed by the oldest updates.',
      inputSchema,
      outputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
        idempotentHint: true
      },
      _meta: {
        ui: { resourceUri: PLAYERS_UI_URI },
        'openai/outputTemplate': PLAYERS_UI_URI,
        'openai/toolInvocation/invoking': 'Finding players…',
        'openai/toolInvocation/invoked': 'Players ready'
      }
    },
    async ({ query, sort = 'name', page = 1 }) => {
      const denied = permissionDenied(auth, 'read:players');
      if (denied) return denied;
      const pageSize = 30;
      const [rows, totalCount] = await Promise.all([
        queryPlayerRows(env.DB, {
          query,
          sort,
          limit: pageSize,
          offset: (page - 1) * pageSize
        }),
        countPlayerRows(env.DB, { query })
      ]);
      const players = rows.map((player: McpPlayerRow) => ({
        id: player.id,
        name: player.name,
        dateOfBirth: player.date_of_birth,
        biographyMarkdown: player.biography_markdown,
        picLink: player.pic_link,
        foot: player.foot,
        height: player.height,
        placeOfBirth: player.place_of_birth,
        position: player.position
      }));
      const output = {
        count: players.length,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNextPage: page * pageSize < totalCount,
        hasPreviousPage: page > 1,
        players
      };
      return {
        structuredContent: output,
        content: [{ text: JSON.stringify(output), type: 'text' }]
      };
    }
  );
}
