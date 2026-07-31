import { queryTransferRows } from '@tranmere-web/lib/src/d1-queries';
import type { TransferRow } from '@tranmere-web/lib/src/d1-types';
import { z } from 'zod';
import { permissionDenied } from '../auth';
import type { ToolContext } from './context';

const outputSchema = z.object({
  count: z.number().int().nonnegative(),
  transfers: z.array(
    z.object({
      id: z.string(),
      playerName: z.string(),
      season: z.number().int(),
      date: z.string().nullable(),
      fromClub: z.string(),
      toClub: z.string(),
      feeDescription: z.string(),
      cost: z.number(),
      direction: z.enum(['In', 'Out'])
    })
  )
});

export function registerGetTransfersTool({ server, env, auth }: ToolContext) {
  server.registerTool(
    'GetTransfers',
    {
      description:
        'Search Tranmere Rovers transfer records in the TranmereWeb database by player, other club, season opening year and/or direction. Use this to research a player movement, check whether a transfer already exists before creating one, or list arrivals and departures. Results include clubs, date, fee information and direction.',
      inputSchema: z.object({
        player: z
          .string()
          .trim()
          .optional()
          .describe('Optionally filter by player name'),
        club: z
          .string()
          .trim()
          .optional()
          .describe('Optionally filter by the other club involved'),
        season: z
          .number()
          .int()
          .min(1900)
          .max(2100)
          .optional()
          .describe('Optionally filter by season starting year'),
        direction: z
          .enum(['In', 'Out'])
          .optional()
          .describe('Optionally return arrivals or departures only'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(500)
          .optional()
          .describe('Maximum number of transfers to return; defaults to 100')
      }),
      outputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
        idempotentHint: true
      }
    },
    async ({ player, club, season, direction, limit }) => {
      const denied = permissionDenied(auth, 'read:transfers');
      if (denied) return denied;
      const rows = await queryTransferRows(env.DB, {
        player,
        club,
        season,
        direction,
        limit: limit ?? 100
      });
      const transfers = rows.map((transfer: TransferRow) => ({
        id: transfer.id,
        playerName: transfer.player_name,
        season: transfer.season,
        date: transfer.transfer_date,
        fromClub: transfer.from_club,
        toClub: transfer.to_club,
        feeDescription: transfer.fee_description,
        cost: transfer.cost,
        direction:
          transfer.to_club === 'Tranmere Rovers'
            ? ('In' as const)
            : ('Out' as const)
      }));
      const output = { count: transfers.length, transfers };
      return {
        structuredContent: output,
        content: [
          {
            text: JSON.stringify(output),
            type: 'text'
          }
        ]
      };
    }
  );
}
