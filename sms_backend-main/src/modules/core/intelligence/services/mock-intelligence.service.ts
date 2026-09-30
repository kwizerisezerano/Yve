import { Injectable } from '@nestjs/common';
import { IntelligenceContext, IntelligencePort, Recommendation } from '../interfaces/intelligence.port';

/** Mock implementation — returns deterministic stub recommendations */
@Injectable()
export class MockIntelligenceService implements IntelligencePort {
  async analyze(context: IntelligenceContext): Promise<Recommendation> {
    const { failureRate = 0, messageCount = 0 } = context;

    if (failureRate > 0.2) {
      return {
        action: 'SWITCH_PROVIDER',
        reason: `Failure rate ${(failureRate * 100).toFixed(1)}% exceeds threshold`,
        confidence: 0.85,
      };
    }
    if (messageCount > 10_000) {
      return {
        action: 'NEGOTIATE_VOLUME_DISCOUNT',
        reason: 'High message volume detected — eligible for bulk pricing',
        confidence: 0.72,
      };
    }
    return {
      action: 'NO_ACTION',
      reason: 'All metrics within normal range',
      confidence: 1.0,
    };
  }
}
