import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AuthContext } from '../interfaces/auth-context.interface';
import { AuthService } from '../services/auth.service';

export interface RequestWithAuth extends Request {
  auth: AuthContext;
}

@Injectable()
export class TenantAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const rawKey = extractBearerToken(request.headers.authorization);
    request.auth = await this.authService.authenticate(rawKey);
    return true;
  }
}

function extractBearerToken(header: string | undefined): string | undefined {
  if (!header) {
    return undefined;
  }
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' ? token : undefined;
}
