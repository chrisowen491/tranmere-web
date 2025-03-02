import { tool } from 'ai';
import { H2HResult, H2HTotal, Match } from "@tranmere-web/lib/src/tranmere-web-types";
import { z } from "zod";

export const ResultsTool = tool({
  description:
    "Get tranmere rovers results for a particular season or against a particular team.",
    parameters: z.object({
    season: z
      .number()
      .optional()
      .describe(
        "The season to get results from - should be the year the season started e.g. the 1993-94 season should be supplied as 1993. Leave blank for all time records or if a specific season is not mentioned.",
      ),
    sort: z
      .enum(["Date", "Date Descending", "Top Attendance"])
      .default("Date")
      .describe("Do you want to sort results by date or by the top attendance"),
    venue: z
      .enum(["Prenton Park", "Wembley Stadium", "Any"])
      .describe(
        "Do you want to filter by results just at home `Prenton Park`, at `Wembley Stadium` or `Any` for all",
      ),
    opposition: z
      .string()
      .describe(
        "The opposition team to filter by - leave blank for all opposition teams",
      ),    
    limit: z
      .number()
      .default(100)
      .describe(
        "How many results to bring back - set to 1 for just the top result",
      ),
  }),
  execute: async ({ season, sort, venue, limit, opposition }) => {
    const realvenue = venue === "Any" || !venue ? "" : venue;
    const realseason = season === 0 || !season ? "" : `${season}`;
    const query = await fetch(
      `https://api.tranmere-web.com/result-search/?season=${realseason}&competition=&opposition=${opposition}&manager=&venue=${realvenue}&pens=&sort=${sort}`,
    );

    const results = (await query.json()) as { 
      results: Match[],     
      h2hresults: H2HResult[];
      h2htotal: H2HTotal[]; 
    };

    const filtered = limit ? results.results.slice(0, limit) : results.results;

    return JSON.stringify( {
      results: 
      filtered.map((r) => {
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
        };
      }),
      h2hresults: results.h2hresults,
      h2htotal: results.h2htotal
    });
  },
});
