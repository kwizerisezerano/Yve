import type { AppConfigService } from '../../../shared/config/app-config.service';
import { RetryPolicyService } from './retry-policy.service';

function setup(overrides: Partial<{ maxAttempts: number; backoffBaseMs: number; backoffMaxMs: number }> = {}) {
  const config = {
    retry: {
      maxAttempts: overrides.maxAttempts ?? 3,
      backoffBaseMs: overrides.backoffBaseMs ?? 1000,
      backoffMaxMs: overrides.backoffMaxMs ?? 30000,
    },
  } as unknown as AppConfigService;
  return new RetryPolicyService(config);
}

describe('RetryPolicyService', () => {
  it('allows a retry while the retry count so far is under the max', () => {
    const policy = setup({ maxAttempts: 3 });

    expect(policy.shouldRetry(0)).toBe(true);
    expect(policy.shouldRetry(2)).toBe(true);
  });

  it('refuses a retry once the retry count reaches the max', () => {
    const policy = setup({ maxAttempts: 3 });

    expect(policy.shouldRetry(3)).toBe(false);
    expect(policy.shouldRetry(4)).toBe(false);
  });

  it('computes an exponential backoff delay from the base, doubling per attempt', () => {
    const policy = setup({ backoffBaseMs: 1000, backoffMaxMs: 30000 });

    expect(policy.backoffDelayMs(1)).toBe(1000);
    expect(policy.backoffDelayMs(2)).toBe(2000);
    expect(policy.backoffDelayMs(3)).toBe(4000);
  });

  it('caps the backoff delay at the configured maximum', () => {
    const policy = setup({ backoffBaseMs: 1000, backoffMaxMs: 5000 });

    expect(policy.backoffDelayMs(10)).toBe(5000);
  });
});
