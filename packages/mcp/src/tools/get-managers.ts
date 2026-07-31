import { queryManagerRows } from '@tranmere-web/lib/src/d1-queries';
import type { ManagerRow } from '@tranmere-web/lib/src/d1-types';
import { z } from 'zod';
import { permissionDenied } from '../auth';
import type { ToolContext } from './context';

const outputSchema = z.object({
  count: z.number().int().nonnegative(),
  managers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      dateJoined: z.string(),
      dateLeft: z.string(),
      programmePath: z.string().nullable()
    })
  )
});

export function registerGetManagersTool({ server, env, auth }: ToolContext) {
  server.registerTool(
    'GetManagers',
    {
      description:
        'Search the TranmereWeb database of Tranmere Rovers managerial history. Use this to identify manager names and spells, including joined and left dates, for historical questions, season research or manager comparisons.',
      inputSchema: z.object({
        query: z
          .string()
          .trim()
          .optional()
          .describe('Optionally filter managers by name'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe(
            'Maximum number of managerial spells to return; defaults to 50'
          )
      }),
      outputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
        idempotentHint: true
      }
    },
    async ({ query, limit }) => {
      const denied = permissionDenied(auth, 'read:managers');
      if (denied) return denied;
      const rows = await queryManagerRows(env.DB, {
        query,
        limit: limit ?? 50
      });
      const managers = rows.map((manager: ManagerRow) => ({
        id: manager.id,
        name: manager.name,
        dateJoined: manager.date_joined,
        dateLeft: manager.date_left,
        programmePath: manager.programme_path
      }));
      const output = { count: managers.length, managers };
      return {
        structuredContent: output,
        content: [
          {
            text: JSON.stringify(output),
            type: 'text'
          }
        ]
      };
    }
  );
}
