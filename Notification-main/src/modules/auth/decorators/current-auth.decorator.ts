import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestWithAuth } from '../guards/tenant-auth.guard';

export const CurrentAuth = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<RequestWithAuth>();
  return request.auth;
});
