import type {
  H2HResult,
  H2HTotal,
  Match
} from '@tranmere-web/lib/src/tranmere-web-types';
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
        'Search the Tranmere Rovers results archive by season opening year, opposition, or both. Use this to find a set of fixtures before calling GetMatchByDate for a full report. At least one of season or opposition is required; season 2025 means the 2025/26 season.',
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
      const query = new URLSearchParams({
        season: season ? String(season) : '',
        competition: '',
        opposition: normalizedOpposition ?? '',
        manager: '',
        venue: '',
        pens: '',
        sort: 'Date Descending'
      });
      const response = await fetch(
        `${env.API_BASE_URL}/result-search/?${query.toString()}`
      );
      if (!response.ok)
        return {
          content: [
            {
              type: 'text',
              text: `The results API returned HTTP ${response.status}.`
            }
          ],
          isError: true
        };
      const data = await response.json<{
        results: Match[];
        h2hresults: H2HResult[];
        h2htotal: H2HTotal[];
      }>();
      const results = (data.results ?? []).slice(0, limit).map((match) => {
        const matchSeason = String(match.season);
        return {
          season: matchSeason,
          date: match.date,
          homeTeam: match.home || 'Unknown',
          awayTeam: match.visitor || 'Unknown',
          score: match.ft || `${match.hgoal}-${match.vgoal}`,
          opposition: match.opposition || normalizedOpposition || 'Unknown',
          venue: match.venue || null,
          attendance:
            typeof match.attendance === 'number' ? match.attendance : null,
          competition: match.competition || null,
          penalties: match.pens || null,
          referee: match.referee || null,
          matchUrl: `https://www.tranmere-web.com/match/${matchSeason}/${match.date}`
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
