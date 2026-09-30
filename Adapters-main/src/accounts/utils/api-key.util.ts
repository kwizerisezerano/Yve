import { randomBytes, createHash } from 'crypto';

export function generateApiKey(): {
  rawKey: string;
  hashedKey: string;
  keyPrefix: string;
} {
  const rawKey = `sk_live_${randomBytes(24).toString('hex')}`;
  const hashedKey = createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = rawKey.slice(0, 12);
  return { rawKey, hashedKey, keyPrefix };
}
