import { PLAYER_POSITIONS } from '@tranmere-web/lib/src/player-constants';
import { z } from 'zod';
import { permissionDenied } from '../auth';
import type { ToolContext } from './context';

const playerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  dateOfBirth: z.string().nullable(),
  biographyMarkdown: z.string().nullable(),
  picLink: z.string().nullable(),
  foot: z.string().nullable(),
  height: z.string().nullable(),
  placeOfBirth: z.string().nullable(),
  position: z.string().nullable(),
  links: z.array(z.string())
});

const inputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe('Date of birth in YYYY-MM-DD format'),
  biographyMarkdown: z.string().trim().max(50_000).optional(),
  picLink: z.url().max(2_000).optional(),
  foot: z.enum(['Left', 'Right']).optional(),
  height: z.string().trim().max(100).optional(),
  placeOfBirth: z.string().trim().max(300).optional(),
  position: z.enum(PLAYER_POSITIONS).optional(),
  links: z.array(z.url().max(2_000)).max(20).optional()
});

export function registerCreatePlayerProfileTool({
  server,
  env,
  auth
}: ToolContext) {
  server.registerTool(
    'CreatePlayerProfile',
    {
      title: 'Create a player profile',
      description:
        'Create a new verified Tranmere Rovers player profile in the TranmereWeb database. Always use GetPlayers first to confirm that no profile exists. Supply the player name and any confirmed biographical details; use the standard avatar-builder URL for picLink where available. This writes a new public profile and must not be used to amend an existing player.',
      inputSchema,
      outputSchema: z.object({ player: playerSchema }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: true,
        idempotentHint: false
      }
    },
    async ({
      name,
      dateOfBirth,
      biographyMarkdown,
      picLink,
      foot,
      height,
      placeOfBirth,
      position,
      links
    }) => {
      const denied = permissionDenied(auth, 'write:players', true);
      if (denied) return denied;
      if (dateOfBirth) {
        const parsed = new Date(`${dateOfBirth}T00:00:00Z`);
        if (
          Number.isNaN(parsed.valueOf()) ||
          parsed.toISOString().slice(0, 10) !== dateOfBirth
        ) {
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
      }
      const existing = await env.DB.prepare(
        'SELECT id FROM Players WHERE name = ? LIMIT 1'
      )
        .bind(name)
        .first<{ id: string }>();
      if (existing)
        return {
          content: [
            {
              type: 'text',
              text: `A player named ${name} already exists. Use the admin page to amend that profile.`
            }
          ],
          isError: true
        };
      const player = {
        id: crypto.randomUUID(),
        name,
        dateOfBirth: dateOfBirth ?? null,
        biographyMarkdown: biographyMarkdown ?? null,
        picLink: picLink ?? null,
        foot: foot ?? null,
        height: height ?? null,
        placeOfBirth: placeOfBirth ?? null,
        position: position ?? null,
        links: links ?? []
      };
      await env.DB.prepare(
        `INSERT INTO Players (id, name, date_of_birth, biography_markdown, pic_link, foot, height, place_of_birth, position, links_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
      )
        .bind(
          player.id,
          player.name,
          player.dateOfBirth,
          player.biographyMarkdown,
          player.picLink,
          player.foot,
          player.height,
          player.placeOfBirth,
          player.position,
          JSON.stringify(player.links)
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
