import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const ResultsTool = new DynamicStructuredTool({
    name: 'tranmere-web-results-tool',
    description: 'Get tranmere rovers results for a particular season - useful for finding the date of a particular match',
    schema: z.object({
        season: z
        .number()
        .describe(
          'The season to get results from - should be the year the season started e.g. the 1993-94 season should be supplied as 1993'
        )
    }),
    func: async ({
      season,
    }) => {
      const query = await fetch(`https://www.tranmere-web.com/result-search/?season=${season}&competition=&opposition=&manager=&venue=&pens=&sort=Date`)

      const results = await query.json() as {results: any[]};
      return JSON.stringify(results.results);
    }
  })