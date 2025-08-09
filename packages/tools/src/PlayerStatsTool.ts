import { tool } from 'ai';
import { PlayerSeasonSummary } from '@tranmere-web/lib/src/tranmere-web-types';
import { z } from 'zod';

export const PlayerStatsTool = tool({
  description: 'Get tranmere rovers player statistics.',
  inputSchema: z.object({
    season: z
      .string()
      .default('')
      .describe(
        'The season to get results from - should be the year the season started e.g. the 1993-94 season should be supplied as 1993. Leave blank for all time records.'
      ),
    player: z.string().describe('A player name to filter results by'),
    sort: z
      .enum(['Starts', 'Goals'])
      .default('Starts')
      .describe(
        'How to order the results - either by the number of starts made by players or the number of goals scored'
      ),
    limit: z
      .number()
      .default(60)
      .describe(
        'How many results to bring back - set to 1 for just the top result - use 60 for searching across a wider range of players'
      )
  }),
  execute: async ({ season, sort, limit, player }) => {
    const query = await fetch(
      `https://api.tranmere-web.com/player-search/?season=${season}&sort=${sort}&filter=`
    );

    const players = (await query.json()) as { players: PlayerSeasonSummary[] };

    let filtered: PlayerSeasonSummary[] = [];

    if (player) {
      filtered = players.players.filter((p) => p.Player === player);
    } else if (limit) {
      filtered = limit ? players.players.slice(0, limit) : players.players;
    }

    return JSON.stringify(
      filtered.map((p) => {
        p.picLink = p.bio?.pic;
        delete p.bio;
        return p;
      })
    );
  }
});
