import { createHash } from 'crypto';
import { generateApiKey, hashApiKey } from './api-key';

describe('api-key', () => {
  it('generateApiKey returns a prefixed, high entropy key that differs on every call', () => {
    const a = generateApiKey();
    const b = generateApiKey();

    expect(a).toMatch(/^ntf_[0-9a-f]{48}$/);
    expect(a).not.toBe(b);
  });

  it('hashApiKey returns the sha256 hex digest of the raw key, deterministically', () => {
    const expected = createHash('sha256').update('raw-key').digest('hex');

    expect(hashApiKey('raw-key')).toBe(expected);
    expect(hashApiKey('raw-key')).toBe(hashApiKey('raw-key'));
  });

  it('hashApiKey differs for different inputs', () => {
    expect(hashApiKey('raw-key-a')).not.toBe(hashApiKey('raw-key-b'));
  });
});
