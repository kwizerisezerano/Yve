import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class StateConflictException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT, 'STATE_CONFLICT');
  }
}
