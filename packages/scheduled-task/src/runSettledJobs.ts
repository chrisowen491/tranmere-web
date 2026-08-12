export interface ScheduledJob {
  name: string;
  run(): Promise<string>;
}

export async function runSettledJobs(jobs: ScheduledJob[]): Promise<void> {
  const results = await Promise.allSettled(jobs.map(({ run }) => run()));
  const failures: Error[] = [];

  results.forEach((result, index) => {
    const job = jobs[index];
    if (result.status === 'fulfilled') {
      console.log(`[${job.name}] ${result.value}`);
      return;
    }

    const error =
      result.reason instanceof Error
        ? result.reason
        : new Error(String(result.reason));
    console.error(`[${job.name}] Failed: ${error.message}`, error);
    failures.push(error);
  });

  if (failures.length > 0) {
    throw new AggregateError(
      failures,
      `${failures.length} of ${jobs.length} scheduled jobs failed.`
    );
  }
}
