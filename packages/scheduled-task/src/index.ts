import { rebuildHatTricks } from './updateHatTricks';
import { rebuildPlayerSeasonSummaries } from './updatePlayerSeasonSummaries';

export interface Env {
  DB: D1Database;
}

/**
 * Add the daily work here. Keeping it separate makes the scheduled handler
 * easy to test and lets it use `ctx.waitUntil` without delaying the trigger.
 */
export async function runDailyTask(env: Env): Promise<void> {
  const summaryCount = await rebuildPlayerSeasonSummaries(env.DB);
  const hatTrickCount = await rebuildHatTricks(env.DB);
  console.log(
    `Rebuilt ${summaryCount} Tranmere-Web player season summary records.`
  );
  console.log(`Rebuilt ${hatTrickCount} Tranmere-Web hat-trick records.`);
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
