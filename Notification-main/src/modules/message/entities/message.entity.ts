import { BaseEntity } from '../../../shared/common/base.entity';

export enum MessageStatus {
  QUEUED = 'queued',
  ROUTED = 'routed',
  SUBMITTED = 'submitted',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETRYING = 'retrying',
  DEAD_LETTER = 'dead_letter',
}

export interface MessageProps {
  id: string;
  tenantId: string;
  sender: string;
  recipient: string;
  body: string;
  type: string;
  status: MessageStatus;
  provider: string | null;
  retryCount: number;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Message extends BaseEntity {
  readonly tenantId: string;
  readonly sender: string;
  readonly recipient: string;
  readonly body: string;
  readonly type: string;
  readonly status: MessageStatus;
  readonly provider: string | null;
  readonly retryCount: number;
  readonly idempotencyKey: string;

  constructor(props: MessageProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.tenantId = props.tenantId;
    this.sender = props.sender;
    this.recipient = props.recipient;
    this.body = props.body;
    this.type = props.type;
    this.status = props.status;
    this.provider = props.provider;
    this.retryCount = props.retryCount;
    this.idempotencyKey = props.idempotencyKey;
  }

  static create(props: Omit<MessageProps, 'status' | 'provider' | 'retryCount'>): Message {
    return new Message({ ...props, status: MessageStatus.QUEUED, provider: null, retryCount: 0 });
  }
}
