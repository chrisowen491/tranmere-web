import { DynamicStructuredTool } from "@langchain/core/tools";
import { PlayerSeasonSummary } from '@tranmere-web/lib/src/tranmere-web-types';
import { z } from "zod";

export interface Result {
  hgoal: any
  season: string
  youtube?: string
  vgoal: any
  venue: string
  ft: string
  programme?: string
  date: string
  opposition: string
  attendance?: number
  competition: string
  pens: string
  static: string
  id: string
  visitor: string
  home: string
  location: string
  largeProgramme?: string
  referee?: string
  formation?: number
}

export const PlayerStatsTool = new DynamicStructuredTool({
    name: 'tranmere-web-player-stats-tool',
    description: 'Get tranmere rovers player statistics for a particular season - or leave season blank for all time records.',
    schema: z.object({
        season: z
        .number()
        .describe(
          'The season to get results from - should be the year the season started e.g. the 1993-94 season should be supplied as 1993'
        ),
        player: z
        .string()
        .describe(
          'A player name to filter results by'
        ),
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
    func: async ({
      season,
      sort,
      limit,
      player
    }) => {
      const query = await fetch(`https://api.prod.tranmere-web.com/player-search/?season=${season}&sort=${sort}&filter=`)

      const players = await query.json() as {players: PlayerSeasonSummary[]};
      
      let filtered : PlayerSeasonSummary[] = [];

      if(player) {
        filtered = players.players.filter(p => p.Player === player);
      } else if(limit) {
        filtered = limit ? players.players.slice(0,limit) : players.players;
      }

      return JSON.stringify(filtered.map (p => {
        p.picLink = p.bio?.pic;
        delete p.bio;
        return p
      }));

    }
  })