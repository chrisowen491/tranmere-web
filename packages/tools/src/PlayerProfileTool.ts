import { tool } from 'ai';
import { z } from 'zod';
import fetch from 'node-fetch';

export const PlayerProfileTool = tool({
  description:
    'Get a full biogropahy of a tranmere rovers player including appearances and goals and transfer history.',
  parameters: z.object({
    player: z.string().describe('The player name ')
  }),
  execute: async ({ player }) => {
    const query = await fetch(
      `https://api.tranmere-web.com/page/player/${player}`
    );

    const profile = await query.json();
    delete profile.appearances;

    return JSON.stringify(profile);
  }
});
