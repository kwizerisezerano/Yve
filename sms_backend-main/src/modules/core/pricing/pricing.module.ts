import { Module } from '@nestjs/common';
import { PricingController } from './controllers/pricing.controller';
import { PricingService } from './services/pricing.service';
import { PRICING_REPOSITORY } from './interfaces/pricing-repository.interface';
import { PrismaPricingRepository } from './repositories/prisma-pricing.repository';

@Module({
  controllers: [PricingController],
  providers: [PricingService, { provide: PRICING_REPOSITORY, useClass: PrismaPricingRepository }],
  exports: [PricingService],
})
export class PricingModule {}
