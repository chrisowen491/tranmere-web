import { DynamicStructuredTool } from "@langchain/core/tools";
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

export const ResultsTool = new DynamicStructuredTool({
    name: 'tranmere-web-results-tool',
    description: 'Get tranmere rovers results for a particular season including attendances - useful for finding the date of a particular match or for answering questions about top attendance records.',
    schema: z.object({
        season: z
        .number()
        .describe(
          'The season to get results from - should be the year the season started e.g. the 1993-94 season should be supplied as 1993. Leave blank for all time records'
        ),
        sort: z
        .enum(['Date', 'Top Attendance'])
        .default('Date')
        .describe(
          'Do you want to sort results by date or by the top attendance'
        ),
        venue: z
        .enum(['Prenton Park', 'Wembley Stadium', 'Any'])
        .describe(
          'Do you want to filter by results just at home `Prenton Park`, at `Wembley Stadium` or `Any` for all'
        ),
        limit: z
        .number()
        .default(100)
        .describe(
          'How many results to bring back - set to 1 for just the top result'
        )
    }),
    func: async ({
      season,
      sort,
      venue,
      limit
    }) => {
      const realvenue = (venue === "Any" || !venue ) ? "" : venue;
      const realseason = (season === 0 || !season ) ? "" : `${season}`;
      const query = await fetch(`https://api.tranmere-web.com/result-search/?season=${realseason}&competition=&opposition=&manager=&venue=${realvenue}&pens=&sort=${sort}`)

      const results = await query.json() as {results: Result[]};

      const filtered = limit ? results.results.slice(0,limit) : results.results;

      return JSON.stringify(filtered.map(r => {
        return {
          season: r.season,
          date: r.date,
          final_score: `${r.home} ${r.hgoal} ${r.visitor} ${r.vgoal}`,
          opposition: r.opposition,
          venue: r.venue,
          attendance: r.attendance,
          competition: r.competition,
          pens: r.pens,
          referee: r.referee,
        }
      }
    ));
    }
  })