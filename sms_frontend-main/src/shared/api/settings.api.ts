import { httpClient } from "./http-client";

export interface SystemSettings {
  smsPrice: number;
  currency: string;
}

let cachedSettings: SystemSettings | null = null;

/**
 * Fetch system settings (SMS price, etc.)
 * Uses cache to avoid repeated API calls
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  if (cachedSettings) {
    return cachedSettings;
  }

  try {
    const settings = await httpClient.get<SystemSettings>("/settings/public");
    cachedSettings = settings;
    return settings;
  } catch (error) {
    // API failed - throw error to indicate no pricing available
    console.error("Failed to fetch system settings from backend", error);
    throw new Error("Unable to fetch system settings. Please check your backend connection.");
  }
}

/**
 * Clear the settings cache (call this when settings are updated)
 */
export function clearSettingsCache() {
  cachedSettings = null;
}

/**
 * Get SMS price synchronously (returns cached value or throws if not available)
 */
export function getSmsPrice(): number {
  if (!cachedSettings?.smsPrice) {
    throw new Error("SMS price not loaded. Call getSystemSettings() first.");
  }
  return cachedSettings.smsPrice;
}
