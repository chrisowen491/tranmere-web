import { GetAllTranmereManagers } from '@tranmere-web/lib/src/apiFunctions';
import { tool } from 'ai';
import { z } from 'zod';

export const ManagerTool = tool({
  description: 'Get info about Tranmere Rovers managers',
  inputSchema: z.object({
    currentManagerOnly: z.boolean().describe('Whether to return only the current manager'),
  }),
  execute: async (input) => {
    const managers = await GetAllTranmereManagers();

    if (input.currentManagerOnly) {
      return JSON.stringify(managers.filter(manager => manager.dateLeft === 'now()'));
    }

    return JSON.stringify(managers);
  }
});
