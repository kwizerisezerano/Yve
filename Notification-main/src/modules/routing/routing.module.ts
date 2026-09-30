import { Module } from '@nestjs/common';
import { ClientsModule } from '../../shared/clients/clients.module';
import { ProviderModule } from '../provider/provider.module';
import { RoutingRuleController } from './controllers/routing-rule.controller';
import { ROUTING_DECISION_REPOSITORY } from './interfaces/routing-decision.repository.interface';
import { ROUTING_RULE_REPOSITORY } from './interfaces/routing-rule.repository.interface';
import { PrismaRoutingDecisionRepository } from './repositories/routing-decision.repository';
import { PrismaRoutingRuleRepository } from './repositories/routing-rule.repository';
import { RoutingDecisionService } from './services/routing-decision.service';
import { RoutingPolicyService } from './services/routing-policy.service';
import { RoutingRuleService } from './services/routing-rule.service';
import { RoutingService } from './services/routing.service';

@Module({
  imports: [ClientsModule, ProviderModule],
  controllers: [RoutingRuleController],
  providers: [
    { provide: ROUTING_RULE_REPOSITORY, useClass: PrismaRoutingRuleRepository },
    { provide: ROUTING_DECISION_REPOSITORY, useClass: PrismaRoutingDecisionRepository },
    RoutingPolicyService,
    RoutingRuleService,
    RoutingDecisionService,
    RoutingService,
  ],
  exports: [RoutingService, RoutingDecisionService],
})
export class RoutingModule {}
