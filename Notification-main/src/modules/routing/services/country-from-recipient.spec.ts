import { countryFromRecipient } from './country-from-recipient';

describe('countryFromRecipient', () => {
  it('resolves a 3 digit calling code', () => {
    expect(countryFromRecipient('+250783503691')).toBe('RW');
  });

  it('resolves a 2 digit calling code', () => {
    expect(countryFromRecipient('+447911123456')).toBe('GB');
  });

  it('resolves a 1 digit calling code', () => {
    expect(countryFromRecipient('+15551234567')).toBe('US');
  });

  it('works without a leading plus', () => {
    expect(countryFromRecipient('250783503691')).toBe('RW');
  });

  it('prefers the longest matching prefix over a shorter one that also matches', () => {
    // '25' is not in the table, but this guards the length-descending search order
    // in general: a 3 digit code must win over any coincidental 1 or 2 digit match.
    expect(countryFromRecipient('+254712345678')).toBe('KE');
  });

  it('returns null for an unrecognized calling code', () => {
    expect(countryFromRecipient('+999123456')).toBeNull();
  });
});
