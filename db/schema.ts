import {
  pgTable,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("isac_users", {
  id: text("id").primaryKey(), // Neon Auth user ID
  email: text("email").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionId: text("subscription_id"),
  subscriptionStatus: text("subscription_status").notNull().default("none"),
  subscriptionExpiresAt: timestamp("subscription_expires_at", {
    withTimezone: true,
  }),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"),
  referralCredits: integer("referral_credits").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const deviceCodes = pgTable("isac_device_codes", {
  id: text("id").primaryKey(), // deviceCode (UUID)
  userCode: text("user_code").notNull(), // e.g. "ABCD-1234"
  status: text("status").notNull().default("pending"), // pending | authorized | expired
  userId: text("user_id"),
  apiKey: text("api_key"), // generated after auth, returned to CLI
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
