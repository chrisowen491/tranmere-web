import { queryPlayerRows } from '@tranmere-web/lib/src/d1-queries';
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
  limit: z
    .number()
    .int()
    .min(1)
    .max(500)
    .optional()
    .describe('Maximum number of players to return; defaults to 100')
});

const outputSchema = z.object({
  count: z.number().int().nonnegative(),
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
              domain: 'https://mcp.tranmere-web.com',
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
        'Search the TranmereWeb database of Tranmere Rovers player profiles. Use this to find a player, check whether a profile already exists before creating one, or retrieve profile facts such as biography, position, birth details and avatar URL. Pass a name query for a specific player; omit it for a browseable list.',
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
    async ({ query, limit }) => {
      const denied = permissionDenied(auth, 'read:players');
      if (denied) return denied;
      const rows = await queryPlayerRows(env.DB, {
        query,
        limit: limit ?? 100
      });
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
      const output = { count: players.length, players };
      return {
        structuredContent: output,
        content: [{ text: JSON.stringify(output), type: 'text' }]
      };
    }
  );
}
