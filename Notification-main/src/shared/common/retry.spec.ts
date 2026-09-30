import { withRetry } from './retry';

describe('withRetry', () => {
  it('returns the result on the first success without retrying', async () => {
    const fn = jest.fn().mockResolvedValue('ok');

    const result = await withRetry(fn, { retries: 3, delayMs: 1 });

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries until it succeeds within the retry budget', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('ok');

    const result = await withRetry(fn, { retries: 3, delayMs: 1 });

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws the last error once the retry budget is exhausted', async () => {
    const error = new Error('always fails');
    const fn = jest.fn().mockRejectedValue(error);

    await expect(withRetry(fn, { retries: 2, delayMs: 1 })).rejects.toThrow(error);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does not retry when shouldRetry returns false', async () => {
    const error = new Error('not retryable');
    const fn = jest.fn().mockRejectedValue(error);

    await expect(
      withRetry(fn, { retries: 3, delayMs: 1, shouldRetry: () => false }),
    ).rejects.toThrow(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
