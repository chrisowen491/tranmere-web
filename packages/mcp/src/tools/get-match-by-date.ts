import type { MatchPageData } from '@tranmere-web/lib/src/tranmere-web-types';
import {
  queryGameBySeasonAndDate,
  queryMatchReportRow
} from '@tranmere-web/lib/src/d1-queries';
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
              domain: env.MCP_WIDGET_DOMAIN,
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
        'Retrieve a Tranmere Rovers match by calendar date (YYYY-MM-DD). Match facts, including score, competition, venue, attendance, formation, programme and report, come from the TranmereWeb database; player goals, line-up and substitutions come from the match API. Use it when the date is known. Returns an error when Tranmere did not play on that date.',
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
      const [game, report] = await Promise.all([
        queryGameBySeasonAndDate(env.DB, season, date),
        queryMatchReportRow(env.DB, date)
      ]);
      if (!game)
        return {
          content: [
            {
              type: 'text',
              text: `No Tranmere Rovers match was found on ${date}.`
            }
          ],
          isError: true
        };

      const response = await fetch(
        `${env.API_BASE_URL}/match/${season}/${encodeURIComponent(date)}`
      );
      const apiMatch = response.ok
        ? await response.json<MatchPageData>()
        : null;
      const programmePath = game.programme_path;
      const programmeUrl =
        programmePath && programmePath !== '#N/A'
          ? programmePath.startsWith('http')
            ? programmePath
            : `https://images.tranmere-web.com/${programmePath}`
          : null;
      const output = {
        match: {
          date: game.match_date,
          season: String(game.season),
          homeTeam: game.home_team,
          awayTeam: game.away_team,
          score:
            game.full_time_score ||
            `${game.home_goals ?? '0'}-${game.away_goals ?? '0'}`,
          competition: game.competition || null,
          venue: game.venue || null,
          attendance: game.attendance,
          referee: game.referee || null,
          formation: game.formation || null,
          goals: (apiMatch?.goals ?? []).map((goal) => ({
            scorer: goal.Scorer,
            minute: goal.Minute || null,
            assist: goal.Assist || null
          })),
          lineup: (apiMatch?.apps ?? []).map((appearance) => ({
            name: appearance.Name,
            number: appearance.Number ? String(appearance.Number) : null,
            substitutedBy: appearance.SubbedBy || null,
            substitutionMinute: appearance.SubTime || null,
            yellowCard: Boolean(appearance.YellowCard),
            redCard: Boolean(appearance.RedCard)
          })),
          substitutes: apiMatch?.substitutes ?? [],
          report: report?.report || null,
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
