import { Logger } from '@nestjs/common';
import { ActivityLogger } from './activity-logger';

describe('ActivityLogger', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs the action alone when no context is given', () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    ActivityLogger.log('message.queued');

    expect(logSpy).toHaveBeenCalledWith('message.queued');
  });

  it('logs the action with its context serialized as JSON', () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    ActivityLogger.log('message.queued', { messageId: 'm1', tenantId: 't1' });

    expect(logSpy).toHaveBeenCalledWith(
      'message.queued {"messageId":"m1","tenantId":"t1"}',
    );
  });

  it('warns with the formatted action and context', () => {
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    ActivityLogger.warn('wallet.low_balance', { tenantId: 't1' });

    expect(warnSpy).toHaveBeenCalledWith('wallet.low_balance {"tenantId":"t1"}');
  });

  it('logs an error with the exception stack when the error is an Error', () => {
    const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const error = new Error('boom');

    ActivityLogger.error('message.dispatch_failed', error, { messageId: 'm1' });

    expect(errorSpy).toHaveBeenCalledWith(
      'message.dispatch_failed {"messageId":"m1"}',
      error.stack,
    );
  });

  it('logs an error with no stack when the error is not an Error instance', () => {
    const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    ActivityLogger.error('message.dispatch_failed', 'unexpected');

    expect(errorSpy).toHaveBeenCalledWith('message.dispatch_failed', undefined);
  });
});
