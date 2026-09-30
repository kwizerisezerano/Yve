import { BaseEntity } from '../../../shared/common/base.entity';

export enum AttemptStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

export interface MessageAttemptProps {
  id: string;
  messageId: string;
  provider: string;
  attemptNumber: number;
  status: AttemptStatus;
  errorCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export class MessageAttempt extends BaseEntity {
  readonly messageId: string;
  readonly provider: string;
  readonly attemptNumber: number;
  readonly status: AttemptStatus;
  readonly errorCode: string | null;
  readonly completedAt: Date | null;

  constructor(props: MessageAttemptProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.messageId = props.messageId;
    this.provider = props.provider;
    this.attemptNumber = props.attemptNumber;
    this.status = props.status;
    this.errorCode = props.errorCode;
    this.completedAt = props.completedAt;
  }

  static create(props: {
    id: string;
    messageId: string;
    provider: string;
    attemptNumber: number;
    createdAt: Date;
  }): MessageAttempt {
    return new MessageAttempt({
      ...props,
      status: AttemptStatus.PENDING,
      errorCode: null,
      updatedAt: props.createdAt,
      completedAt: null,
    });
  }

  withOutcome(status: AttemptStatus.SUCCEEDED | AttemptStatus.FAILED, errorCode: string | null): MessageAttempt {
    const completedAt = new Date();
    return new MessageAttempt({
      ...this.toProps(),
      status,
      errorCode,
      completedAt,
      updatedAt: completedAt,
    });
  }

  private toProps(): MessageAttemptProps {
    return {
      id: this.id,
      messageId: this.messageId,
      provider: this.provider,
      attemptNumber: this.attemptNumber,
      status: this.status,
      errorCode: this.errorCode,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      completedAt: this.completedAt,
    };
  }
}
