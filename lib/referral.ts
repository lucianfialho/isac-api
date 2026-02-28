/**
 * Generates a referral code from a user's name or email.
 * Format: NAME-XXXX (e.g. "LUCIAN-X7K2")
 */
export function generateReferralCode(nameOrEmail: string): string {
  const base = nameOrEmail.split("@")[0].replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 8);
  const name = base || "ISAC";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${name}-${suffix}`;
}
