import { randomUUID } from "crypto";

/**
 * Generates a human-readable user code (e.g. "ABCD-1234")
 */
export function generateUserCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "0123456789";

  let letters = "";
  for (let i = 0; i < 4; i++) {
    letters += chars[Math.floor(Math.random() * chars.length)];
  }

  let nums = "";
  for (let i = 0; i < 4; i++) {
    nums += digits[Math.floor(Math.random() * digits.length)];
  }

  return `${letters}-${nums}`;
}

/**
 * Generates a device code (UUID)
 */
export function generateDeviceCode(): string {
  return randomUUID();
}

/**
 * Generates a random API key for CLI usage
 */
export function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "isac_";
  for (let i = 0; i < 48; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}
