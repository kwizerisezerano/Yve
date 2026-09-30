import { Prisma } from '@prisma/client';
import {
  isForeignKeyViolation,
  isKnownPrismaError,
  isUnclassifiedForeignKeyViolation,
} from './prisma-errors';

function knownError(code: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('boom', { code, clientVersion: '5.22.0' });
}

function unknownError(message: string): Prisma.PrismaClientUnknownRequestError {
  return new Prisma.PrismaClientUnknownRequestError(message, { clientVersion: '5.22.0' });
}

describe('prisma-errors', () => {
  it('isKnownPrismaError matches a known error with the given code', () => {
    expect(isKnownPrismaError(knownError('P2025'), 'P2025')).toBe(true);
    expect(isKnownPrismaError(knownError('P2003'), 'P2025')).toBe(false);
    expect(isKnownPrismaError(new Error('plain'), 'P2025')).toBe(false);
  });

  it('isUnclassifiedForeignKeyViolation matches an unknown error mentioning a foreign key constraint', () => {
    expect(
      isUnclassifiedForeignKeyViolation(unknownError('violates RESTRICT setting of foreign key constraint')),
    ).toBe(true);
    expect(isUnclassifiedForeignKeyViolation(unknownError('some other database error'))).toBe(false);
    expect(isUnclassifiedForeignKeyViolation(new Error('plain'))).toBe(false);
  });

  it('isForeignKeyViolation matches both the known P2003 code and the unclassified message shape', () => {
    expect(isForeignKeyViolation(knownError('P2003'))).toBe(true);
    expect(
      isForeignKeyViolation(unknownError('update or delete violates foreign key constraint')),
    ).toBe(true);
    expect(isForeignKeyViolation(knownError('P2025'))).toBe(false);
    expect(isForeignKeyViolation(new Error('plain'))).toBe(false);
  });
});
