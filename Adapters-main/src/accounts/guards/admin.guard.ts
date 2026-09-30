import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const adminKey = request.headers['x-admin-key'];
    const expectedKey = process.env.ADMIN_API_KEY;

    if (!expectedKey) {
      throw new InternalServerErrorException(
        'ADMIN_API_KEY is not configured.',
      );
    }

    if (adminKey !== expectedKey) {
      throw new UnauthorizedException('Missing or invalid x-admin-key header.');
    }

    return true;
  }
}
