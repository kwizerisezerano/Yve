import { ExecutionContext } from '@nestjs/common';
import { UnauthorizedDomainException } from '../../../shared/common/exceptions/unauthorized.exception';
import { AuthContext } from '../interfaces/auth-context.interface';
import type { AuthService } from '../services/auth.service';
import { RequestWithAuth, TenantAuthGuard } from './tenant-auth.guard';

function createAuthContext(): AuthContext {
  return { tenantId: 't1', defaultSender: 'ACME' };
}

function createContext(authorization: string | undefined): {
  context: ExecutionContext;
  request: Partial<RequestWithAuth>;
} {
  const request: Partial<RequestWithAuth> = { headers: { authorization } as never };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

describe('TenantAuthGuard', () => {
  it('extracts the bearer token, authenticates it, and attaches the auth context to the request', async () => {
    const auth = createAuthContext();
    const authService = { authenticate: jest.fn().mockResolvedValue(auth) } as unknown as jest.Mocked<AuthService>;
    const guard = new TenantAuthGuard(authService);
    const { context, request } = createContext('Bearer raw-key');

    const result = await guard.canActivate(context);

    expect(authService.authenticate).toHaveBeenCalledWith('raw-key');
    expect(request.auth).toBe(auth);
    expect(result).toBe(true);
  });

  it('is case insensitive about the Bearer scheme', async () => {
    const authService = {
      authenticate: jest.fn().mockResolvedValue(createAuthContext()),
    } as unknown as jest.Mocked<AuthService>;
    const guard = new TenantAuthGuard(authService);
    const { context } = createContext('bearer raw-key');

    await guard.canActivate(context);

    expect(authService.authenticate).toHaveBeenCalledWith('raw-key');
  });

  it('passes undefined to authenticate when the header is missing', async () => {
    const authService = {
      authenticate: jest.fn().mockRejectedValue(new UnauthorizedDomainException('Missing api key or token.')),
    } as unknown as jest.Mocked<AuthService>;
    const guard = new TenantAuthGuard(authService);
    const { context } = createContext(undefined);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedDomainException);
    expect(authService.authenticate).toHaveBeenCalledWith(undefined);
  });

  it('passes undefined to authenticate when the scheme is not Bearer', async () => {
    const authService = {
      authenticate: jest.fn().mockRejectedValue(new UnauthorizedDomainException('Missing api key or token.')),
    } as unknown as jest.Mocked<AuthService>;
    const guard = new TenantAuthGuard(authService);
    const { context } = createContext('Basic dXNlcjpwYXNz');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedDomainException);
    expect(authService.authenticate).toHaveBeenCalledWith(undefined);
  });
});
