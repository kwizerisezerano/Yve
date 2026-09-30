// A curated, non exhaustive table of calling codes to ISO country codes.
// NANP numbers (+1) all resolve to US, the full area code split between
// NANP members is out of scope. Extend this table as real routing needs
// widen, do not treat it as a complete E.164 reference.
const CALLING_CODES: Record<string, string> = {
  '1': 'US',
  '7': 'RU',
  '20': 'EG',
  '27': 'ZA',
  '30': 'GR',
  '31': 'NL',
  '32': 'BE',
  '33': 'FR',
  '34': 'ES',
  '36': 'HU',
  '39': 'IT',
  '40': 'RO',
  '41': 'CH',
  '43': 'AT',
  '44': 'GB',
  '45': 'DK',
  '46': 'SE',
  '47': 'NO',
  '48': 'PL',
  '49': 'DE',
  '51': 'PE',
  '52': 'MX',
  '54': 'AR',
  '55': 'BR',
  '56': 'CL',
  '57': 'CO',
  '58': 'VE',
  '60': 'MY',
  '61': 'AU',
  '62': 'ID',
  '63': 'PH',
  '64': 'NZ',
  '65': 'SG',
  '66': 'TH',
  '81': 'JP',
  '82': 'KR',
  '84': 'VN',
  '86': 'CN',
  '90': 'TR',
  '91': 'IN',
  '92': 'PK',
  '94': 'LK',
  '211': 'SS',
  '212': 'MA',
  '213': 'DZ',
  '216': 'TN',
  '218': 'LY',
  '220': 'GM',
  '221': 'SN',
  '223': 'ML',
  '225': 'CI',
  '233': 'GH',
  '234': 'NG',
  '237': 'CM',
  '243': 'CD',
  '244': 'AO',
  '250': 'RW',
  '251': 'ET',
  '252': 'SO',
  '254': 'KE',
  '255': 'TZ',
  '256': 'UG',
  '257': 'BI',
  '260': 'ZM',
  '263': 'ZW',
  '264': 'NA',
  '265': 'MW',
  '266': 'LS',
  '267': 'BW',
  '971': 'AE',
  '972': 'IL',
  '966': 'SA',
};

const MAX_PREFIX_LENGTH = 3;

export function countryFromRecipient(recipient: string): string | null {
  const digits = recipient.replace(/^\+/, '');

  for (let length = MAX_PREFIX_LENGTH; length >= 1; length -= 1) {
    const prefix = digits.slice(0, length);
    const country = CALLING_CODES[prefix];
    if (country) {
      return country;
    }
  }

  return null;
}
