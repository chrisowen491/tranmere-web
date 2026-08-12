import { updateAlgoliaSearchIndex } from './updateAlgoliaSearchIndex';
import { runSettledJobs, type ScheduledJob } from './runSettledJobs';
import { rebuildHatTricks } from './updateHatTricks';
import { rebuildPlayerMilestones } from './updatePlayerMilestones';
import { rebuildPlayerSeasonSummaries } from './updatePlayerSeasonSummaries';

export interface Env {
  DB: D1Database;
  ALGOLIA_API_KEY?: string;
  ALGOLIA_APPLICATION_ID: string;
  ALGOLIA_INDEX_NAME: string;
}

/**
 * Add the daily work here. Keeping it separate makes the scheduled handler
 * easy to test and lets it use `ctx.waitUntil` without delaying the trigger.
 */
export async function runDailyTask(env: Env): Promise<void> {
  const jobs: ScheduledJob[] = [
    {
      name: 'player-season-summaries',
      run: async () => {
        const count = await rebuildPlayerSeasonSummaries(env.DB);
        return `Rebuilt ${count} Tranmere-Web player season summary records.`;
      }
    },
    {
      name: 'hat-tricks',
      run: async () => {
        const count = await rebuildHatTricks(env.DB);
        return `Rebuilt ${count} Tranmere-Web hat-trick records.`;
      }
    },
    {
      name: 'player-milestones',
      run: async () => {
        const count = await rebuildPlayerMilestones(env.DB);
        return `Rebuilt ${count} Tranmere-Web player milestone records.`;
      }
    },
    {
      name: 'algolia-search-index',
      run: async () => {
        if (!env.ALGOLIA_API_KEY) {
          throw new Error(
            'ALGOLIA_API_KEY is not configured for the scheduled task Worker.'
          );
        }
        const result = await updateAlgoliaSearchIndex(env.DB, {
          applicationId: env.ALGOLIA_APPLICATION_ID,
          apiKey: env.ALGOLIA_API_KEY,
          indexName: env.ALGOLIA_INDEX_NAME
        });
        return `Uploaded ${result.uploaded} Algolia records (${result.players} players, ${result.clubs} clubs and ${result.seasons} seasons).`;
      }
    }
  ];

  await runSettledJobs(jobs);
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log(
      `Starting daily task triggered at ${new Date(controller.scheduledTime).toISOString()}.`
    );
    ctx.waitUntil(runDailyTask(env));
  }
} satisfies ExportedHandler<Env>;
