/**
 * SMS Credits Calculation Utility
 * 
 * Converts RWF balance to SMS message count
 * NO HARDCODED DEFAULTS - Always pass pricePerSms from backend API
 */

/**
 * Calculate how many SMS messages can be sent with the given balance
 * @param balanceRwf - Balance in Rwandan Francs
 * @param pricePerSms - Price per SMS (REQUIRED - fetch from backend via useSystemSettings)
 * @returns Number of SMS messages (floor value, no fractional SMS)
 */
export function calculateSmsCredits(balanceRwf: number, pricePerSms: number): number {
  return Math.floor(balanceRwf / pricePerSms);
}

/**
 * Calculate the cost in RWF for a given number of SMS messages
 * @param smsCount - Number of SMS messages
 * @param pricePerSms - Price per SMS (REQUIRED - fetch from backend via useSystemSettings)
 * @returns Cost in RWF
 */
export function calculateSmsCost(smsCount: number, pricePerSms: number): number {
  return smsCount * pricePerSms;
}

/**
 * Format SMS count for display
 * @param balanceRwf - Balance in Rwandan Francs
 * @param pricePerSms - Price per SMS (REQUIRED - fetch from backend via useSystemSettings)
 * @returns Formatted string like "3,333 SMS"
 */
export function formatSmsCredits(balanceRwf: number, pricePerSms: number): string {
  const count = calculateSmsCredits(balanceRwf, pricePerSms);
  return `${count.toLocaleString()} SMS`;
}
