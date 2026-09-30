import { createHash, randomBytes } from 'crypto';

export function generateApiKey(): string {
  return `ntf_${randomBytes(24).toString('hex')}`;
}

export function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}
