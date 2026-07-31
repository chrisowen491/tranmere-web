import { queryClubRows } from '@tranmere-web/lib/src/d1-queries';
import type { ClubRow } from '@tranmere-web/lib/src/d1-types';
import { z } from 'zod';
import { permissionDenied } from '../auth';
import type { ToolContext } from './context';

const outputSchema = z.object({
  count: z.number().int().nonnegative(),
  clubs: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      shortName: z.string().nullable(),
      threeLetterName: z.string().nullable(),
      nicknames: z.string().nullable(),
      primaryColour: z.string().nullable(),
      secondaryColour: z.string().nullable(),
      highestDivision: z.number().int().nullable(),
      latitude: z.number().nullable(),
      longitude: z.number().nullable()
    })
  )
});

export function registerGetClubsTool({ server, env, auth }: ToolContext) {
  server.registerTool(
    'GetClubs',
    {
      description:
        'Search the TranmereWeb database clubs directory for opposition clubs and their canonical names, aliases, colours and location data. Use this before CreateTransfer whenever a club is involved, since transfer creation requires the exact canonical club name returned here.',
      inputSchema: z.object({
        query: z
          .string()
          .trim()
          .optional()
          .describe('Optionally filter clubs by name, short name or nickname'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(500)
          .optional()
          .describe('Maximum number of clubs to return; defaults to 100')
      }),
      outputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
        idempotentHint: true
      }
    },
    async ({ query, limit }) => {
      const denied = permissionDenied(auth, 'read:clubs');
      if (denied) return denied;
      const rows = await queryClubRows(env.DB, { query, limit: limit ?? 100 });
      const clubs = rows.map((club: ClubRow) => ({
        id: club.id,
        name: club.name,
        shortName: club.short_name,
        threeLetterName: club.three_letter_name,
        nicknames: club.nicknames,
        primaryColour: club.primary_colour,
        secondaryColour: club.secondary_colour,
        highestDivision: club.highest_division,
        latitude: club.latitude,
        longitude: club.longitude
      }));
      const output = { count: clubs.length, clubs };
      return {
        structuredContent: output,
        content: [{ text: JSON.stringify(output), type: 'text' }]
      };
    }
  );
}
