import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../shared/config/app-config.service';

@Injectable()
export class RetryPolicyService {
  constructor(private readonly config: AppConfigService) {}

  shouldRetry(retryCountSoFar: number): boolean {
    return retryCountSoFar < this.config.retry.maxAttempts;
  }

  backoffDelayMs(retryAttemptNumber: number): number {
    const { backoffBaseMs, backoffMaxMs } = this.config.retry;
    const delay = backoffBaseMs * 2 ** (retryAttemptNumber - 1);
    return Math.min(delay, backoffMaxMs);
  }
}
