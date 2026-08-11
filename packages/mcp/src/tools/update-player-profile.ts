import { PLAYER_POSITIONS } from '@tranmere-web/lib/src/player-constants';
import type { PlayerRow } from '@tranmere-web/lib/src/d1-types';
import { z } from 'zod';
import { permissionDenied } from '../auth';
import type { ToolContext } from './context';

const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  dateOfBirth: z.string().nullable(),
  biographyMarkdown: z.string().nullable(),
  picLink: z.string().nullable(),
  foot: z.string().nullable(),
  height: z.string().nullable(),
  placeOfBirth: z.string().nullable(),
  position: z.string().nullable(),
  secondaryPosition: z.string().nullable(),
  links: z.array(z.string())
});

const inputSchema = z
  .object({
    id: z.string().describe('The existing D1 player ID returned by GetPlayers'),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional()
      .describe('Date of birth in YYYY-MM-DD format. Pass null to clear it.'),
    biographyMarkdown: z
      .string()
      .trim()
      .max(50_000)
      .nullable()
      .optional()
      .describe('Profile biography in Markdown. Pass null to clear it.'),
    picLink: z
      .url()
      .max(2_000)
      .nullable()
      .optional()
      .describe('Avatar or profile-image URL. Pass null to clear it.'),
    foot: z
      .enum(['Left', 'Right'])
      .nullable()
      .optional()
      .describe('Preferred foot. Pass null to clear it.'),
    height: z
      .string()
      .trim()
      .max(100)
      .nullable()
      .optional()
      .describe('Player height. Pass null to clear it.'),
    placeOfBirth: z
      .string()
      .trim()
      .max(300)
      .nullable()
      .optional()
      .describe('Place of birth. Pass null to clear it.'),
    position: z
      .enum(PLAYER_POSITIONS)
      .nullable()
      .optional()
      .describe('Primary playing position. Pass null to clear it.'),
    secondaryPosition: z
      .enum(PLAYER_POSITIONS)
      .nullable()
      .optional()
      .describe('Secondary playing position. Pass null to clear it.'),
    links: z
      .array(z.url().max(2_000))
      .max(20)
      .optional()
      .describe('Replacement list of verified source URLs.')
  })
  .refine(
    (input) =>
      Object.entries(input).some(
        ([key, value]) => key !== 'id' && value !== undefined
      ),
    { message: 'Provide at least one profile field to update.' }
  );

function validDate(value: string) {
  const parsed = new Date(value + 'T00:00:00Z');
  return (
    !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function parseLinks(linksJson: string) {
  try {
    const links = JSON.parse(linksJson);
    return Array.isArray(links)
      ? links.filter((link): link is string => typeof link === 'string')
      : [];
  } catch {
    return [];
  }
}

function toPlayer(row: PlayerRow) {
  return {
    id: row.id,
    name: row.name,
    dateOfBirth: row.date_of_birth,
    biographyMarkdown: row.biography_markdown,
    picLink: row.pic_link,
    foot: row.foot,
    height: row.height,
    placeOfBirth: row.place_of_birth,
    position: row.position,
    secondaryPosition: row.secondary_position,
    links: parseLinks(row.links_json)
  };
}

export function registerUpdatePlayerProfileTool({
  server,
  env,
  auth
}: ToolContext) {
  server.registerTool(
    'UpdatePlayerProfile',
    {
      title: 'Update a player profile',
      description:
        'Update confirmed profile information for an existing Tranmere Rovers player in the TranmereWeb database. Use GetPlayers first to find the player and obtain their D1 ID. The player name cannot be changed with this tool. Provide only fields that need changing; pass null to deliberately clear a nullable field.',
      inputSchema,
      outputSchema: z.object({ player: playerSchema }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
        idempotentHint: true
      }
    },
    async (input) => {
      const denied = permissionDenied(auth, 'write:players', true);
      if (denied) return denied;

      if (input.dateOfBirth && !validDate(input.dateOfBirth)) {
        return {
          content: [
            {
              type: 'text',
              text: 'The date of birth must be a valid date in YYYY-MM-DD format.'
            }
          ],
          isError: true
        };
      }

      const existing = await env.DB.prepare(
        'SELECT id, name, date_of_birth, biography_markdown, pic_link, foot, ' +
          'height, place_of_birth, position, secondary_position, links_json, updated_at ' +
          'FROM Players WHERE id = ? LIMIT 1'
      )
        .bind(input.id)
        .first<PlayerRow>();
      if (!existing) {
        return {
          content: [
            {
              type: 'text',
              text:
                'No player profile exists with ID ' +
                input.id +
                '. Use GetPlayers first to find the correct profile.'
            }
          ],
          isError: true
        };
      }

      const player = {
        ...toPlayer(existing),
        dateOfBirth:
          input.dateOfBirth === undefined
            ? existing.date_of_birth
            : input.dateOfBirth,
        biographyMarkdown:
          input.biographyMarkdown === undefined
            ? existing.biography_markdown
            : input.biographyMarkdown,
        picLink:
          input.picLink === undefined ? existing.pic_link : input.picLink,
        foot: input.foot === undefined ? existing.foot : input.foot,
        height: input.height === undefined ? existing.height : input.height,
        placeOfBirth:
          input.placeOfBirth === undefined
            ? existing.place_of_birth
            : input.placeOfBirth,
        position:
          input.position === undefined ? existing.position : input.position,
        secondaryPosition:
          input.secondaryPosition === undefined
            ? existing.secondary_position
            : input.secondaryPosition,
        links:
          input.links === undefined
            ? parseLinks(existing.links_json)
            : input.links
      };

      if (
        player.position &&
        player.secondaryPosition &&
        player.position === player.secondaryPosition
      ) {
        return {
          content: [
            {
              type: 'text',
              text: 'Primary and secondary position must be different.'
            }
          ],
          isError: true
        };
      }

      await env.DB.prepare(
        'UPDATE Players SET date_of_birth = ?, biography_markdown = ?, ' +
          'pic_link = ?, foot = ?, height = ?, place_of_birth = ?, position = ?, ' +
          'secondary_position = ?, links_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      )
        .bind(
          player.dateOfBirth,
          player.biographyMarkdown,
          player.picLink,
          player.foot,
          player.height,
          player.placeOfBirth,
          player.position,
          player.secondaryPosition,
          JSON.stringify(player.links),
          player.id
        )
        .run();

      const output = { player };
      return {
        structuredContent: output,
        content: [{ type: 'text', text: JSON.stringify(output) }]
      };
    }
  );
}
