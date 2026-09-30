export interface RetryOptions {
  retries: number;
  delayMs: number;
  factor?: number;
  shouldRetry?: (error: unknown) => boolean;
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { retries, delayMs, factor = 2, shouldRetry = () => true } = options;
  let attempt = 0;
  let currentDelay = delayMs;

  for (;;) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries || !shouldRetry(error)) {
        throw error;
      }
      await sleep(currentDelay);
      currentDelay *= factor;
      attempt += 1;
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
