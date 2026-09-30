import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class EntityNotFoundException extends DomainException {
  constructor(entity: string, identifier: string) {
    super(`${entity} not found: ${identifier}`, HttpStatus.NOT_FOUND, 'ENTITY_NOT_FOUND');
  }
}
