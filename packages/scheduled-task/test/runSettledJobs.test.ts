import { afterEach, describe, expect, it, vi } from 'vitest';

import { runSettledJobs } from '../src/runSettledJobs';

describe('runSettledJobs', () => {
  afterEach(() => vi.restoreAllMocks());

  it('runs every job and logs each successful result', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const first = vi.fn().mockResolvedValue('first complete');
    const second = vi.fn().mockResolvedValue('second complete');

    await runSettledJobs([
      { name: 'first', run: first },
      { name: 'second', run: second }
    ]);

    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledWith('[first] first complete');
    expect(log).toHaveBeenCalledWith('[second] second complete');
  });

  it('allows other jobs to finish before reporting individual failures', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const errorLog = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const failed = vi.fn().mockRejectedValue(new Error('database unavailable'));
    const successful = vi.fn().mockResolvedValue('still complete');

    await expect(
      runSettledJobs([
        { name: 'failed-job', run: failed },
        { name: 'successful-job', run: successful }
      ])
    ).rejects.toThrow('1 of 2 scheduled jobs failed.');

    expect(failed).toHaveBeenCalledOnce();
    expect(successful).toHaveBeenCalledOnce();
    expect(errorLog).toHaveBeenCalledWith(
      '[failed-job] Failed: database unavailable',
      expect.any(Error)
    );
  });
});
