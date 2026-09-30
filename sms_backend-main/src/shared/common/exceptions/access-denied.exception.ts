import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class AccessDeniedException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.FORBIDDEN, 'ACCESS_DENIED');
  }
}
