import { Global, Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ApiKeyGuard } from './guards/api-key.guard';
import { UserModule } from '../user/user.module';
import { TenantModule } from '../tenant/tenant.module';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'ingoga-super-secret',
      signOptions: { expiresIn: '24h' },
    }),
    UserModule,
    forwardRef(() => TenantModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ApiKeyGuard],
  exports: [AuthService, ApiKeyGuard, JwtModule, PassportModule],
})
export class AuthModule {}
