import { HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { ApiResponse } from './api-response';

function createResponse(): { res: Response; statusFn: jest.Mock; jsonFn: jest.Mock } {
  const jsonFn = jest.fn();
  const statusFn = jest.fn().mockReturnValue({ json: jsonFn });
  const res = { status: statusFn } as unknown as Response;
  return { res, statusFn, jsonFn };
}

describe('ApiResponse', () => {
  it('success sets the given status and a success body with the given message and data', () => {
    const { res, statusFn, jsonFn } = createResponse();

    ApiResponse.success(res, 'Created', { id: '1' }, HttpStatus.CREATED);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.CREATED);
    expect(jsonFn).toHaveBeenCalledWith({
      success: true,
      message: 'Created',
      data: { id: '1' },
    });
  });

  it('success defaults to 200, message Success, and null data', () => {
    const { res, statusFn, jsonFn } = createResponse();

    ApiResponse.success(res);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonFn).toHaveBeenCalledWith({
      success: true,
      message: 'Success',
      data: null,
    });
  });

  it('error sets the given status and a failure body with the given message and data', () => {
    const { res, statusFn, jsonFn } = createResponse();

    ApiResponse.error(res, 'Not enough funds', { code: 'INSUFFICIENT_FUNDS' }, HttpStatus.PAYMENT_REQUIRED);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.PAYMENT_REQUIRED);
    expect(jsonFn).toHaveBeenCalledWith({
      success: false,
      message: 'Not enough funds',
      data: { code: 'INSUFFICIENT_FUNDS' },
    });
  });

  it('error defaults to 400, a generic message, and null data', () => {
    const { res, statusFn, jsonFn } = createResponse();

    ApiResponse.error(res);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonFn).toHaveBeenCalledWith({
      success: false,
      message: 'An error occurred',
      data: null,
    });
  });
});
