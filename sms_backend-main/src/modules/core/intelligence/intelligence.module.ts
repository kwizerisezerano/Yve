import { Module } from '@nestjs/common';
import { INTELLIGENCE_PORT } from './interfaces/intelligence.port';
import { MockIntelligenceService } from './services/mock-intelligence.service';

@Module({
  providers: [
    MockIntelligenceService,
    { provide: INTELLIGENCE_PORT, useClass: MockIntelligenceService },
  ],
  exports: [INTELLIGENCE_PORT],
})
export class IntelligenceModule {}
