import { Logger } from '@nestjs/common';

export type ActivityContext = Record<string, unknown>;

export class ActivityLogger {
  private static readonly logger = new Logger('Activity');

  static log(action: string, context?: ActivityContext): void {
    this.logger.log(this.format(action, context));
  }

  static warn(action: string, context?: ActivityContext): void {
    this.logger.warn(this.format(action, context));
  }

  static error(action: string, error?: unknown, context?: ActivityContext): void {
    const stack = error instanceof Error ? error.stack : undefined;
    this.logger.error(this.format(action, context), stack);
  }

  private static format(action: string, context?: ActivityContext): string {
    return context ? `${action} ${JSON.stringify(context)}` : action;
  }
}
