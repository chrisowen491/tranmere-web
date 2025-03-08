import { tool } from 'ai';
import { z } from 'zod';

export const TransferTool = tool({
  description:
    'Returns information about historic tranmere rovers player transfers - use this to search for transfer information results are sorted by the amount of money involved',
  parameters: z.object({
    season: z
      .number()
      .nullable()
      .describe(
        'The season the transfer occured - should be the year the season started e.g. the 1993-94 season should be supplied as 1993 - leave blank for all time records'
      ),
    type: z
      .enum(['In', 'Out'])
      .describe(
        'The type of transfer - In being a player joining Tranmere, Out being a player leaving'
      ),
    club: z
      .string()
      .default('')
      .describe(
        'The club other than Tranmere Rovers involved in the transfer - leave blank for any club'
      )
  }),
  execute: async ({ season, type, club }) => {
    const query = await fetch(
      `https://api.tranmere-web.com/transfer-search/?season${season}=&filter=${type}&club=${club}`
    );

    const results = await query.json();
    return JSON.stringify(results);
  }
});
