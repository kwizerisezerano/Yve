import { Prisma } from '@prisma/client';

export const PRISMA_FOREIGN_KEY_VIOLATION = 'P2003';
export const PRISMA_RECORD_NOT_FOUND = 'P2025';
export const PRISMA_UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

export function isKnownPrismaError(error: unknown, code: string): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

// Postgres enforces some RESTRICT relations before Prisma's own emulated
// referential actions run, so that specific violation surfaces as an
// unclassified PrismaClientUnknownRequestError rather than a known P2003.
export function isUnclassifiedForeignKeyViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientUnknownRequestError &&
    /foreign key constraint/i.test(error.message)
  );
}

export function isForeignKeyViolation(error: unknown): boolean {
  return (
    isKnownPrismaError(error, PRISMA_FOREIGN_KEY_VIOLATION) || isUnclassifiedForeignKeyViolation(error)
  );
}
