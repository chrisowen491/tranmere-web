import { GetAllTranmereManagers } from '@tranmere-web/lib/src/apiFunctions';
import { tool } from 'ai';
import { z } from 'zod';

export const ManagerTool = tool({
  description: 'Get info about Tranmere Rovers managers',
  inputSchema: z.object({}),
  execute: async () => {
    const managers = await GetAllTranmereManagers();
    return JSON.stringify(managers);
  }
});
