import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { ApiKeysController } from './api-keys/api-keys.controller';
import { ApiKeysService } from './api-keys/api-keys.service';
import { AdminOrOwnKeyGuard } from './guards/admin-or-own-key.guard';
import { AdminGuard } from './guards/admin.guard';
import { IpWhitelistController } from './ip-whitelist/ip-whitelist.controller';
import { IpWhitelistService } from './ip-whitelist/ip-whitelist.service';

@Module({
  controllers: [AccountsController, ApiKeysController, IpWhitelistController],
  providers: [
    AccountsService,
    ApiKeysService,
    IpWhitelistService,
    AdminGuard,
    AdminOrOwnKeyGuard,
  ],
})
export class AccountsModule {}
