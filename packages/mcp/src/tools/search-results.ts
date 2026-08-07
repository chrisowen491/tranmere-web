import { queryGameRows } from '@tranmere-web/lib/src/d1-queries';
import type { GameRow } from '@tranmere-web/lib/src/d1-types';
import { z } from 'zod';
import { permissionDenied } from '../auth';
import type { ToolContext } from './context';

const outputSchema = z.object({
  count: z.number().int().nonnegative(),
  filters: z.object({
    season: z.number().int().nullable(),
    opposition: z.string().nullable()
  }),
  results: z.array(
    z.object({
      season: z.string(),
      date: z.string(),
      homeTeam: z.string(),
      awayTeam: z.string(),
      score: z.string(),
      opposition: z.string(),
      venue: z.string().nullable(),
      attendance: z.number().nullable(),
      competition: z.string().nullable(),
      penalties: z.string().nullable(),
      referee: z.string().nullable(),
      matchUrl: z.string()
    })
  )
});

export function registerSearchResultsTool({ server, env, auth }: ToolContext) {
  server.registerTool(
    'SearchResults',
    {
      title: 'Search Tranmere results',
      description:
        'Search the TranmereWeb database of Tranmere Rovers results by season opening year, opposition, or both. Use this to find fixtures before calling GetMatchByDate for player events and a full report. At least one of season or opposition is required; season 2025 means the 2025/26 season.',
      inputSchema: z.object({
        season: z
          .number()
          .int()
          .min(1884)
          .max(2100)
          .optional()
          .describe(
            'The year the season started, for example 1993 for the 1993-94 season'
          ),
        opposition: z
          .string()
          .trim()
          .optional()
          .describe('The exact opposition team name'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(500)
          .optional()
          .describe('Maximum results to return; defaults to 100')
      }),
      outputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
        idempotentHint: true
      }
    },
    async ({ season, opposition, limit = 100 }) => {
      const denied = permissionDenied(auth, 'read:matches');
      if (denied) return denied;
      const normalizedOpposition = opposition?.trim() || undefined;
      if (!season && !normalizedOpposition)
        return {
          content: [
            {
              type: 'text',
              text: 'Supply a season, an opposition team name, or both.'
            }
          ],
          isError: true
        };
      const rows = await queryGameRows(env.DB, {
        season,
        opposition: normalizedOpposition,
        sort: 'date-desc',
        limit
      });
      const results = rows.map((match: GameRow) => {
        const matchSeason = String(match.season);
        return {
          season: matchSeason,
          date: match.match_date,
          homeTeam: match.home_team,
          awayTeam: match.away_team,
          score:
            match.full_time_score ||
            `${match.home_goals ?? '0'}-${match.away_goals ?? '0'}`,
          opposition: match.opposition || normalizedOpposition || 'Unknown',
          venue: match.venue || null,
          attendance: match.attendance,
          competition: match.competition || null,
          penalties: match.penalties || null,
          referee: match.referee || null,
          matchUrl: `https://www.tranmere-web.com/match/${matchSeason}/${match.match_date}`
        };
      });
      const output = {
        count: results.length,
        filters: {
          season: season ?? null,
          opposition: normalizedOpposition ?? null
        },
        results
      };
      return {
        structuredContent: output,
        content: [{ type: 'text', text: JSON.stringify(output) }]
      };
    }
  );
}
