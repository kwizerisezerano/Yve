import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { USER_READER_PORT, UserReaderPort } from '../../user/interfaces/user-reader.port';
import { TENANT_READER_PORT, TenantReaderPort } from '../../tenant/interfaces/tenant-reader.port';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export interface LoginResult {
  accessToken: string;
  user: { id: string; email: string; role: string };
  tenant: { id: string; name: string };
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_READER_PORT) private readonly userReader: UserReaderPort,
    @Inject(forwardRef(() => TENANT_READER_PORT)) private readonly tenantReader: TenantReaderPort,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.userReader.findByEmailGlobally(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tenant = await this.tenantReader.findById(user.tenantId);
    const payload: JwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      tenant: {
        id: user.tenantId,
        name: tenant?.name ?? 'Ingoga Demo',
      },
    };
  }

  async validatePayload(payload: JwtPayload): Promise<JwtPayload> {
    return payload;
  }
}
