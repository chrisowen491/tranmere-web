import { McpServer } from '@modelcontextprotocol/server';
import {
  queryClubRows,
  queryManagerRows,
  queryPlayerRows,
  queryTransferRows
} from '@tranmere-web/lib/src/d1-queries';
import type {
  ClubRow,
  ManagerRow,
  PlayerRow,
  TransferRow
} from '@tranmere-web/lib/src/d1-types';
import { createMcpHandler } from 'agents/mcp/server';
import { z } from 'zod';
import type {
  H2HResult,
  H2HTotal,
  Match,
  MatchPageData
} from '@tranmere-web/lib/src/tranmere-web-types';
import {
  authenticateRequest,
  type McpAuthContext,
  permissionDenied,
  protectedResourceMetadata
} from './auth';
import { PLAYERS_UI_URI, playersWidgetHtml } from './player-widget';
import { MATCH_UI_URI, matchWidgetHtml } from './match-widget';

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

function createServer(env: Env, auth: McpAuthContext) {
  const server = new McpServer({
    name: 'Tranmere-Web MCP',
    version: '1.0.0'
  });

  const playerInputSchema = z.object({
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
  const playerOutputSchema = z.object({
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

  server.registerResource('players-ui', PLAYERS_UI_URI, {}, async () => ({
    contents: [
      {
        uri: PLAYERS_UI_URI,
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
  }));

  server.registerTool(
    'GetPlayers',
    {
      description:
        'Returns a list of Tranmere Rovers Players from the database',
      inputSchema: playerInputSchema,
      outputSchema: playerOutputSchema,
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

      const resultLimit = limit ?? 100;
      const rows = await queryPlayerRows(env.DB, {
        query,
        limit: resultLimit
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
        content: [
          {
            text: JSON.stringify(output),
            type: 'text'
          }
        ]
      };
    }
  );

  const playerProfileSchema = z.object({
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

  server.registerTool(
    'CreatePlayerProfile',
    {
      title: 'Create a player profile',
      description:
        'Creates a new Tranmere Rovers player profile in D1. Use only for a verified player who does not already have a profile.',
      inputSchema: z.object({
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
        position: z
          .enum([
            'Goalkeeper',
            'Striker',
            'Winger',
            'Central Defender',
            'Central Midfielder',
            'Full Back'
          ])
          .optional(),
        links: z.array(z.url().max(2_000)).max(20).optional()
      }),
      outputSchema: z.object({ player: playerProfileSchema }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
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
      const denied = permissionDenied(auth, 'write:players');
      if (denied) return denied;

      if (dateOfBirth) {
        const parsedDate = new Date(`${dateOfBirth}T00:00:00Z`);
        if (
          Number.isNaN(parsedDate.valueOf()) ||
          parsedDate.toISOString().slice(0, 10) !== dateOfBirth
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
      if (existing) {
        return {
          content: [
            {
              type: 'text',
              text: `A player named ${name} already exists. Use the admin page to amend that profile.`
            }
          ],
          isError: true
        };
      }

      const id = crypto.randomUUID();
      const player = {
        id,
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
        `INSERT INTO Players (
             id, name, date_of_birth, biography_markdown, pic_link, foot,
             height, place_of_birth, position, links_json
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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

  const matchOutputSchema = z.object({
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
      matchUrl: z.string()
    })
  });

  const matchUiUris = [
    'ui://tranmere-web/match-v1.html',
    'ui://tranmere-web/match-v2.html',
    MATCH_UI_URI
  ];

  matchUiUris.forEach((uri, index) => {
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
                resourceDomains: []
              }
            }
          }
        }
      ]
    }));
  });

  server.registerTool(
    'GetMatchByDate',
    {
      title: 'Get a Tranmere match',
      description:
        'Returns details of a specific Tranmere Rovers match from its date',
      inputSchema: z.object({
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .describe('Match date in YYYY-MM-DD format')
      }),
      outputSchema: matchOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
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

      const parsedDate = new Date(`${date}T12:00:00Z`);
      if (
        Number.isNaN(parsedDate.valueOf()) ||
        parsedDate.toISOString().slice(0, 10) !== date
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
        parsedDate.getUTCMonth() >= 6
          ? parsedDate.getUTCFullYear()
          : parsedDate.getUTCFullYear() - 1;
      const response = await fetch(
        `${env.API_BASE_URL}/match/${season}/${encodeURIComponent(date)}`
      );

      if (!response.ok) {
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
      }

      const apiMatch = (await response.json()) as MatchPageData;
      const homeTeam = apiMatch.homeTeam || apiMatch.home || 'Unknown';
      const awayTeam = apiMatch.awayTeam || apiMatch.visitor || 'Unknown';
      const score =
        apiMatch.score ||
        apiMatch.ft ||
        `${String(apiMatch.hgoal)}-${String(apiMatch.vgoal)}`;

      const match = {
        date: apiMatch.date,
        season: String(apiMatch.season),
        homeTeam,
        awayTeam,
        score,
        competition: apiMatch.competition || null,
        venue: apiMatch.venue || null,
        attendance:
          typeof apiMatch.attendance === 'number' ? apiMatch.attendance : null,
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
        matchUrl: `https://www.tranmere-web.com/match/${season}/${date}`
      };
      const output = { match };

      return {
        structuredContent: output,
        content: [
          {
            type: 'text',
            text: JSON.stringify(output)
          }
        ]
      };
    }
  );

  const resultsOutputSchema = z.object({
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

  server.registerTool(
    'SearchResults',
    {
      title: 'Search Tranmere results',
      description:
        'Search Tranmere Rovers match results by season, opposition team name, or both',
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
      outputSchema: resultsOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
        idempotentHint: true
      }
    },
    async ({ season, opposition, limit = 100 }) => {
      const denied = permissionDenied(auth, 'read:matches');
      if (denied) return denied;

      const normalizedOpposition = opposition?.trim() || undefined;
      if (!season && !normalizedOpposition) {
        return {
          content: [
            {
              type: 'text',
              text: 'Supply a season, an opposition team name, or both.'
            }
          ],
          isError: true
        };
      }

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

      if (!response.ok) {
        return {
          content: [
            {
              type: 'text',
              text: `The results API returned HTTP ${response.status}.`
            }
          ],
          isError: true
        };
      }

      const data = (await response.json()) as {
        results: Match[];
        h2hresults: H2HResult[];
        h2htotal: H2HTotal[];
      };
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

  const transferOutputSchema = z.object({
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

  server.registerTool(
    'CreateTransfer',
    {
      title: 'Create a transfer record',
      description:
        'Creates a Tranmere Rovers transfer record in D1. Use verified information only and keep Tranmere Rovers on exactly one side of the move.',
      inputSchema: z.object({
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
          .describe('The club the player is leaving'),
        toClub: z
          .string()
          .trim()
          .min(1)
          .max(200)
          .describe('The club the player is joining'),
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
      }),
      outputSchema: transferOutputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
        idempotentHint: false
      }
    },
    async (input) => {
      const denied = permissionDenied(auth, 'write:transfers');
      if (denied) return denied;

      const playerName = input.playerName;
      const season = input.season;
      const fromClub = input.fromClub;
      const toClub = input.toClub;
      const feeDescription = input.feeDescription ?? '';
      const cost = input.cost ?? 0;
      const date = input.date ?? undefined;

      if (date) {
        const parsedDate = new Date(`${date}T00:00:00Z`);
        if (
          Number.isNaN(parsedDate.valueOf()) ||
          parsedDate.toISOString().slice(0, 10) !== date
        ) {
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
      }

      const isTranmere = (club: string) =>
        club.toLocaleLowerCase() === 'tranmere rovers';
      const findClub = (club: string) =>
        isTranmere(club)
          ? Promise.resolve({ name: 'Tranmere Rovers' })
          : env.DB.prepare(
              'SELECT name FROM Clubs WHERE lower(name) = lower(?)'
            )
              .bind(club)
              .first<{ name: string }>();
      const [fromClubRecord, toClubRecord] = await Promise.all([
        findClub(fromClub),
        findClub(toClub)
      ]);

      if (!fromClubRecord || !toClubRecord) {
        const missing = [
          !fromClubRecord ? fromClub : null,
          !toClubRecord ? toClub : null
        ].filter(Boolean);
        return {
          content: [
            {
              type: 'text',
              text: `The following club name${missing.length === 1 ? '' : 's'} ${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} not in the Clubs D1 table. Use GetClubs to find the canonical name first.`
            }
          ],
          isError: true
        };
      }

      const canonicalFromClub = fromClubRecord.name;
      const canonicalToClub = toClubRecord.name;
      const fromTranmere = canonicalFromClub === 'Tranmere Rovers';
      const toTranmere = canonicalToClub === 'Tranmere Rovers';
      if (fromTranmere === toTranmere) {
        return {
          content: [
            {
              type: 'text',
              text: 'Tranmere Rovers must appear on exactly one side of the transfer.'
            }
          ],
          isError: true
        };
      }

      const duplicate = await env.DB.prepare(
        `SELECT id FROM Transfers
           WHERE player_name = ? AND season = ? AND from_club = ? AND to_club = ?
             AND ((transfer_date IS NULL AND ? IS NULL) OR transfer_date = ?)
           LIMIT 1`
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
      if (duplicate) {
        return {
          content: [
            {
              type: 'text',
              text: `This transfer already exists with id ${duplicate.id}.`
            }
          ],
          isError: true
        };
      }

      const id = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO Transfers (
             id, player_name, season, from_club, to_club, fee_description, cost,
             transfer_date
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
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

  server.registerTool(
    'GetClubs',
    {
      description: 'Returns Tranmere Rovers opposition clubs from the database',
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
      })
    },
    async ({ query, limit }) => {
      const denied = permissionDenied(auth, 'read:clubs');
      if (denied) return denied;

      const resultLimit = limit ?? 100;
      const rows = await queryClubRows(env.DB, {
        query,
        limit: resultLimit
      });

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

      return {
        content: [
          {
            text: JSON.stringify({ count: clubs.length, clubs }),
            type: 'text'
          }
        ]
      };
    }
  );

  server.registerTool(
    'GetTransfers',
    {
      description: 'Returns Tranmere Rovers transfer records from the database',
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
      })
    },
    async ({ player, club, season, direction, limit }) => {
      const denied = permissionDenied(auth, 'read:transfers');
      if (denied) return denied;

      const resultLimit = limit ?? 100;
      const rows = await queryTransferRows(env.DB, {
        player,
        club,
        season,
        direction,
        limit: resultLimit
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

      return {
        content: [
          {
            text: JSON.stringify({ count: transfers.length, transfers }),
            type: 'text'
          }
        ]
      };
    }
  );

  server.registerTool(
    'GetManagers',
    {
      description: 'Returns Tranmere Rovers manager records from the database',
      inputSchema: z.object({
        query: z
          .string()
          .trim()
          .optional()
          .describe('Optionally filter managers by name'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe(
            'Maximum number of managerial spells to return; defaults to 50'
          )
      })
    },
    async ({ query, limit }) => {
      const denied = permissionDenied(auth, 'read:managers');
      if (denied) return denied;

      const resultLimit = limit ?? 50;
      const rows = await queryManagerRows(env.DB, {
        query,
        limit: resultLimit
      });

      const managers = rows.map((manager: ManagerRow) => ({
        id: manager.id,
        name: manager.name,
        dateJoined: manager.date_joined,
        dateLeft: manager.date_left,
        programmePath: manager.programme_path
      }));

      return {
        content: [
          {
            text: JSON.stringify({ count: managers.length, managers }),
            type: 'text'
          }
        ]
      };
    }
  );

  return server;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (
      url.pathname === '/.well-known/oauth-protected-resource' ||
      url.pathname === '/.well-known/oauth-protected-resource/mcp'
    ) {
      return Response.json(protectedResourceMetadata(env), {
        headers: { 'Cache-Control': 'no-store' }
      });
    }

    if (url.pathname !== '/mcp') {
      return new Response('Not found', { status: 404 });
    }

    const message = await request
      .clone()
      .json<{
        method?: string;
        params?: { name?: string; arguments?: unknown };
      }>()
      .catch(() => null);
    const toolCall = message?.method === 'tools/call';
    if (toolCall) {
      console.log('MCP tool call', {
        tool: message.params?.name,
        arguments: message.params?.arguments
      });
    }

    const auth = await authenticateRequest(request, env);
    if (auth instanceof Response) return auth;

    const response = await createMcpHandler(() => createServer(env, auth))(
      request,
      env,
      ctx
    );
    if (toolCall) {
      console.log('MCP tool response', {
        status: response.status,
        body: (await response.clone().text()).slice(0, 8_000)
      });
    }
    return response;
  }
} satisfies ExportedHandler<Env>;
