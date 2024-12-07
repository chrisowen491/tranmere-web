import { DynamicStructuredTool } from "@langchain/core/tools";
import { MatchPageData } from "@tranmere-web/lib/src/tranmere-web-types";
import { z } from "zod";

export const MatchTool = new DynamicStructuredTool({
  name: "tranmere-web-match-tool",
  description:
    "Get tranmere rovers match information from a historic fixture - only use if you know the specific date of the match",
  schema: z.object({
    date: z
      .string()
      .describe("The date the match occured in YYYY-MM-DD format"),
  }),
  func: async ({ date }) => {
    const theDate = new Date(date);
    const season =
      theDate.getUTCMonth() > 6
        ? theDate.getFullYear()
        : theDate.getFullYear() - 1;
    const query = await fetch(
      `https://api.tranmere-web.com/match/${season}/${date}`,
    );
    const results = (await query.json()) as MatchPageData;
    delete results.apps;
    delete results.id;
    delete results.report;
    delete results.goals;
    return JSON.stringify(results);
  },
});
