import { runSettledJobs, type ScheduledJob } from './runSettledJobs';
import { rebuildArchiveCompleteness } from './updateArchiveCompleteness';
import { rebuildHatTricks } from './updateHatTricks';
import { rebuildPlayerMilestones } from './updatePlayerMilestones';
import { rebuildPlayerSeasonSummaries } from './updatePlayerSeasonSummaries';
import { rebuildSearchIndex } from './updateSearchIndex';

export interface Env {
  DB: D1Database;
  CF_SPACE: string;
  CF_KEY: string;
}

/**
 * Add the weekly work here. Keeping it separate makes the scheduled handler
 * easy to test and lets it use `ctx.waitUntil` without delaying the trigger.
 */
export async function runDailyTask(env: Env): Promise<void> {
  const jobs: ScheduledJob[] = [
    {
      name: 'archive-completeness',
      run: async () => {
        const count = await rebuildArchiveCompleteness(env.DB);
        return `Rebuilt ${count} archive completeness records.`;
      }
    },
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
        const result = await rebuildSearchIndex(env.DB, {
          space: env.CF_SPACE,
          accessToken: env.CF_KEY
        });
        return `Rebuilt ${result.indexed} search records (${result.players} players, ${result.clubs} clubs, ${result.seasons} seasons, ${result.blogs} articles and ${result.pages} static pages).`;
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
      `Starting weekly task triggered at ${new Date(controller.scheduledTime).toISOString()}.`
    );
    ctx.waitUntil(runDailyTask(env));
  }
} satisfies ExportedHandler<Env>;
