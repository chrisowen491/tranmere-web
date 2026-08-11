import { z } from 'zod';
import { permissionDenied } from '../auth';
import type { ToolContext } from './context';

const recognisedTransferValues = new Map(
  ['Tranmere Rovers', 'Retired', 'Released', 'Trainee'].map((value) => [
    value.toLocaleLowerCase(),
    value
  ])
);

const inputSchema = z.object({
  playerName: z.string().trim().min(1).max(200),
  season: z
    .number()
    .int()
    .min(1800)
    .max(2200)
    .describe('The year the relevant football season started'),
  fromClub: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .describe(
      'The club the player is leaving, or Retired, Released or Trainee'
    ),
  toClub: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .describe(
      'The club the player is joining, or Retired, Released or Trainee'
    ),
  feeDescription: z.string().trim().max(200).nullish(),
  cost: z
    .number()
    .int()
    .nonnegative()
    .nullish()
    .describe('Verified fee in whole pounds; use 0 when unknown or free'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish()
    .describe('Verified effective transfer date in YYYY-MM-DD format')
});

const outputSchema = z.object({
  transfer: z.object({
    id: z.string().uuid(),
    playerName: z.string(),
    season: z.number().int(),
    fromClub: z.string(),
    toClub: z.string(),
    feeDescription: z.string(),
    cost: z.number().int().nonnegative(),
    date: z.string().nullable(),
    direction: z.enum(['In', 'Out'])
  })
});

export function registerCreateTransferTool({ server, env, auth }: ToolContext) {
  server.registerTool(
    'CreateTransfer',
    {
      title: 'Create a transfer record',
      description:
        'Create one verified incoming or outgoing Tranmere Rovers transfer record in the TranmereWeb database. Before creating it, use GetPlayers to check the player name, GetClubs to obtain canonical club names, and GetTransfers to avoid duplicates. Tranmere Rovers must appear on exactly one side of the move; Retired, Released and Trainee are accepted as non-club statuses. Season is the opening year, and date, fee description and cost are optional.',
      inputSchema,
      outputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: true,
        idempotentHint: false
      }
    },
    async (input) => {
      const denied = permissionDenied(auth, 'write:transfers', true);
      if (denied) return denied;
      const { playerName, season, fromClub, toClub } = input;
      const feeDescription = input.feeDescription ?? '';
      const cost = input.cost ?? 0;
      const date = input.date ?? undefined;
      if (date) {
        const parsed = new Date(`${date}T00:00:00Z`);
        if (
          Number.isNaN(parsed.valueOf()) ||
          parsed.toISOString().slice(0, 10) !== date
        )
          return {
            content: [
              {
                type: 'text',
                text: 'The transfer date must be a valid date in YYYY-MM-DD format.'
              }
            ],
            isError: true
          };
      }
      const findClub = (club: string) => {
        const recognisedValue = recognisedTransferValues.get(
          club.toLocaleLowerCase()
        );
        if (recognisedValue) return Promise.resolve({ name: recognisedValue });
        return env.DB.prepare(
          'SELECT name FROM Clubs WHERE lower(name) = lower(?)'
        )
          .bind(club)
          .first<{ name: string }>();
      };
      const [fromRecord, toRecord] = await Promise.all([
        findClub(fromClub),
        findClub(toClub)
      ]);
      if (!fromRecord || !toRecord) {
        const missing = [
          !fromRecord ? fromClub : null,
          !toRecord ? toClub : null
        ].filter(Boolean);
        return {
          content: [
            {
              type: 'text',
              text: `The following club name${missing.length === 1 ? '' : 's'} ${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} not in the TranmereWeb database. Use GetClubs to find the canonical name first.`
            }
          ],
          isError: true
        };
      }
      const canonicalFromClub = fromRecord.name;
      const canonicalToClub = toRecord.name;
      const fromTranmere = canonicalFromClub === 'Tranmere Rovers';
      const toTranmere = canonicalToClub === 'Tranmere Rovers';
      if (fromTranmere === toTranmere)
        return {
          content: [
            {
              type: 'text',
              text: 'Tranmere Rovers must appear on exactly one side of the transfer.'
            }
          ],
          isError: true
        };
      const duplicate = await env.DB.prepare(
        `SELECT id FROM Transfers WHERE player_name = ? AND season = ? AND from_club = ? AND to_club = ? AND ((transfer_date IS NULL AND ? IS NULL) OR transfer_date = ?) LIMIT 1`
      )
        .bind(
          playerName,
          season,
          canonicalFromClub,
          canonicalToClub,
          date ?? null,
          date ?? null
        )
        .first<{ id: string }>();
      if (duplicate)
        return {
          content: [
            {
              type: 'text',
              text: `This transfer already exists with id ${duplicate.id}.`
            }
          ],
          isError: true
        };
      const id = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO Transfers (id, player_name, season, from_club, to_club, fee_description, cost, transfer_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          id,
          playerName,
          season,
          canonicalFromClub,
          canonicalToClub,
          feeDescription,
          cost,
          date ?? null
        )
        .run();
      const output = {
        transfer: {
          id,
          playerName,
          season,
          fromClub: canonicalFromClub,
          toClub: canonicalToClub,
          feeDescription,
          cost,
          date: date ?? null,
          direction: toTranmere ? ('In' as const) : ('Out' as const)
        }
      };
      return {
        structuredContent: output,
        content: [{ type: 'text', text: JSON.stringify(output) }]
      };
    }
  );
}
