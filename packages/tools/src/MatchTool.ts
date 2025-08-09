import { tool } from 'ai';
import { MatchPageData } from '@tranmere-web/lib/src/tranmere-web-types';
import { z } from 'zod';

export const MatchTool = tool({
  description:
    'Get tranmere rovers match information (incluidng scorers) from a historic fixture - only use if you know the specific date of the match',
  inputSchema: z.object({
    date: z.string().describe('The date the match occured in YYYY-MM-DD format')
  }),
  execute: async ({ date }) => {
    const theDate = new Date(date);
    const season =
      theDate.getUTCMonth() > 6
        ? theDate.getFullYear()
        : theDate.getFullYear() - 1;
    const query = await fetch(
      `https://api.tranmere-web.com/match/${season}/${date}`
    );
    const results = (await query.json()) as MatchPageData;
    delete results.id;
    delete results.report;
    delete results.goals;
    return JSON.stringify(results);
  }
});
