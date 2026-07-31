import type { MatchPageData } from '@tranmere-web/lib/src/tranmere-web-types';
import { z } from 'zod';
import { permissionDenied } from '../auth';
import { MATCH_UI_URI, matchWidgetHtml } from '../match-widget';
import type { ToolContext } from './context';

const outputSchema = z.object({
  match: z.object({
    date: z.string(),
    season: z.string(),
    homeTeam: z.string(),
    awayTeam: z.string(),
    score: z.string(),
    competition: z.string().nullable(),
    venue: z.string().nullable(),
    attendance: z.number().nullable(),
    referee: z.string().nullable(),
    formation: z.string().nullable(),
    goals: z.array(
      z.object({
        scorer: z.string(),
        minute: z.string().nullable(),
        assist: z.string().nullable()
      })
    ),
    lineup: z.array(
      z.object({
        name: z.string(),
        number: z.string().nullable(),
        substitutedBy: z.string().nullable(),
        substitutionMinute: z.string().nullable(),
        yellowCard: z.boolean(),
        redCard: z.boolean()
      })
    ),
    substitutes: z.array(z.string()),
    report: z.string().nullable(),
    programmeUrl: z.url().nullable(),
    matchUrl: z.string()
  })
});

export function registerGetMatchByDateTool({ server, env, auth }: ToolContext) {
  const uiUris = [
    'ui://tranmere-web/match-v1.html',
    'ui://tranmere-web/match-v2.html',
    'ui://tranmere-web/match-v3.html',
    'ui://tranmere-web/match-v4.html',
    MATCH_UI_URI
  ];
  uiUris.forEach((uri, index) =>
    server.registerResource(`match-ui-v${index + 1}`, uri, {}, async () => ({
      contents: [
        {
          uri,
          mimeType: 'text/html;profile=mcp-app',
          text: matchWidgetHtml,
          _meta: {
            ui: {
              prefersBorder: false,
              domain: 'https://mcp.tranmere-web.com',
              csp: {
                connectDomains: [],
                resourceDomains: ['https://images.tranmere-web.com']
              }
            }
          }
        }
      ]
    }))
  );

  server.registerTool(
    'GetMatchByDate',
    {
      title: 'Get a Tranmere match',
      description:
        'Retrieve the full Tranmere Rovers match record for one calendar date (YYYY-MM-DD). Use this when the date is known and you need the score, competition, venue, attendance, goals, line-up, substitutions or match-report link. Returns an error when Tranmere did not play on that date.',
      inputSchema: z.object({
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .describe('Match date in YYYY-MM-DD format')
      }),
      outputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
        idempotentHint: true
      },
      _meta: {
        ui: { resourceUri: MATCH_UI_URI },
        'openai/outputTemplate': MATCH_UI_URI,
        'openai/toolInvocation/invoking': 'Finding the match…',
        'openai/toolInvocation/invoked': 'Match ready'
      }
    },
    async ({ date }) => {
      const denied = permissionDenied(auth, 'read:matches');
      if (denied) return denied;
      const parsed = new Date(`${date}T12:00:00Z`);
      if (
        Number.isNaN(parsed.valueOf()) ||
        parsed.toISOString().slice(0, 10) !== date
      ) {
        return {
          content: [
            {
              type: 'text',
              text: 'The match date must be a valid date in YYYY-MM-DD format.'
            }
          ],
          isError: true
        };
      }
      const season =
        parsed.getUTCMonth() >= 6
          ? parsed.getUTCFullYear()
          : parsed.getUTCFullYear() - 1;
      const response = await fetch(
        `${env.API_BASE_URL}/match/${season}/${encodeURIComponent(date)}`
      );
      if (!response.ok)
        return {
          content: [
            {
              type: 'text',
              text:
                response.status === 404
                  ? `No Tranmere Rovers match was found on ${date}.`
                  : `The match API returned HTTP ${response.status}.`
            }
          ],
          isError: true
        };
      const apiMatch = await response.json<MatchPageData>();
      const homeTeam = apiMatch.homeTeam || apiMatch.home || 'Unknown';
      const awayTeam = apiMatch.awayTeam || apiMatch.visitor || 'Unknown';
      const score =
        apiMatch.score ||
        apiMatch.ft ||
        `${String(apiMatch.hgoal)}-${String(apiMatch.vgoal)}`;
      const programmeUrl = apiMatch.programme
        ? apiMatch.programme.startsWith('http')
          ? apiMatch.programme
          : `https://images.tranmere-web.com/${apiMatch.programme}`
        : null;
      const output = {
        match: {
          date: apiMatch.date,
          season: String(apiMatch.season),
          homeTeam,
          awayTeam,
          score,
          competition: apiMatch.competition || null,
          venue: apiMatch.venue || null,
          attendance:
            typeof apiMatch.attendance === 'number'
              ? apiMatch.attendance
              : null,
          referee: apiMatch.referee || null,
          formation: apiMatch.formation || null,
          goals: (apiMatch.goals ?? []).map((goal) => ({
            scorer: goal.Scorer,
            minute: goal.Minute || null,
            assist: goal.Assist || null
          })),
          lineup: (apiMatch.apps ?? []).map((appearance) => ({
            name: appearance.Name,
            number: appearance.Number ? String(appearance.Number) : null,
            substitutedBy: appearance.SubbedBy || null,
            substitutionMinute: appearance.SubTime || null,
            yellowCard: Boolean(appearance.YellowCard),
            redCard: Boolean(appearance.RedCard)
          })),
          substitutes: apiMatch.substitutes ?? [],
          report: apiMatch.report?.report || null,
          programmeUrl,
          matchUrl: `https://www.tranmere-web.com/match/${season}/${date}`
        }
      };
      return {
        structuredContent: output,
        content: [{ type: 'text', text: JSON.stringify(output) }]
      };
    }
  );
}
