import { runSettledJobs, type ScheduledJob } from './runSettledJobs';
import { rebuildHatTricks } from './updateHatTricks';
import { rebuildPlayerMilestones } from './updatePlayerMilestones';
import { rebuildPlayerSeasonSummaries } from './updatePlayerSeasonSummaries';
import { rebuildSearchIndex } from './updateSearchIndex';

export interface Env {
  DB: D1Database;
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
      name: 'search-index',
      run: async () => {
        const result = await rebuildSearchIndex(env.DB);
        return `Rebuilt ${result.indexed} search records (${result.players} players, ${result.clubs} clubs and ${result.seasons} seasons).`;
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
