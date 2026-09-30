import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './exception.filter';
import { NotFoundDomainException } from './exceptions/not-found.exception';

function createHost(url: string, statusFn: jest.Mock, jsonFn: jest.Mock): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ url }),
      getResponse: () => ({ status: statusFn, json: jsonFn }),
      getNext: () => undefined,
    }),
  } as unknown as ArgumentsHost;
}

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
  });

  it('maps a domain exception to its declared http status, message, and error code', () => {
    const jsonFn = jest.fn();
    const statusFn = jest.fn().mockReturnValue({ json: jsonFn });
    const host = createHost('/messages', statusFn, jsonFn);

    filter.catch(new NotFoundDomainException('message not found'), host);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'message not found',
        data: expect.objectContaining({
          code: 'NOT_FOUND',
          path: '/messages',
        }),
      }),
    );
  });

  it('maps a Nest http exception using its own status', () => {
    const jsonFn = jest.fn();
    const statusFn = jest.fn().mockReturnValue({ json: jsonFn });
    const host = createHost('/messages', statusFn, jsonFn);

    filter.catch(new BadRequestException('bad input'), host);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'bad input',
      }),
    );
  });

  it('falls back to a generic internal error for an unknown exception', () => {
    const jsonFn = jest.fn();
    const statusFn = jest.fn().mockReturnValue({ json: jsonFn });
    const host = createHost('/messages', statusFn, jsonFn);

    filter.catch(new Error('boom'), host);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'An unexpected error occurred.',
        data: expect.objectContaining({ code: 'INTERNAL_ERROR' }),
      }),
    );
  });
});
