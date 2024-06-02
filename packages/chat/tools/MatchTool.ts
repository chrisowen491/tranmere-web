import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const MatchTool = new DynamicStructuredTool({
    name: 'tranmere-web-match-tool',
    description: 'Get tranmere rovers match information from a historic fixture',
    schema: z.object({
        season: z
        .number()
        .describe(
          'The season to the match occured from - should be the year the season started e.g. the 1993-94 season should be supplied as 1993'
        ),
        date: z
        .string()
        .describe(
          'The date the match occured in YYYY-MM-DD format'
        )
    }),
    func: async ({
      season,
      date
    }) => {
      const query = await fetch(`http://localhost:8788/match/${season}/${date}?json=true`)

      const results = await query.json()
      return JSON.stringify(results);
    }
  })