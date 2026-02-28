import { getDb, schema } from "@/db";
import { eq } from "drizzle-orm";

const { users, deviceCodes } = schema;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type DeviceCode = typeof deviceCodes.$inferSelect;

// ── Users ──

export async function getUserById(id: string): Promise<User | undefined> {
  const rows = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0];
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const rows = await getDb().select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0];
}

export async function getUserByStripeCustomer(customerId: string): Promise<User | undefined> {
  const rows = await getDb().select().from(users).where(eq(users.stripeCustomerId, customerId)).limit(1);
  return rows[0];
}

export async function getUserByReferralCode(code: string): Promise<User | undefined> {
  const rows = await getDb().select().from(users).where(eq(users.referralCode, code)).limit(1);
  return rows[0];
}

export async function createUser(data: NewUser): Promise<User> {
  const rows = await getDb().insert(users).values(data).returning();
  return rows[0];
}

export async function updateUser(id: string, data: Partial<Omit<NewUser, "id">>): Promise<User> {
  const rows = await getDb().update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id)).returning();
  return rows[0];
}

// ── Device Codes ──

export async function createDeviceCode(data: typeof deviceCodes.$inferInsert): Promise<DeviceCode> {
  const rows = await getDb().insert(deviceCodes).values(data).returning();
  return rows[0];
}

export async function getDeviceCodeById(id: string): Promise<DeviceCode | undefined> {
  const rows = await getDb().select().from(deviceCodes).where(eq(deviceCodes.id, id)).limit(1);
  return rows[0];
}

export async function getDeviceCodeByUserCode(userCode: string): Promise<DeviceCode | undefined> {
  const rows = await getDb().select().from(deviceCodes).where(eq(deviceCodes.userCode, userCode)).limit(1);
  return rows[0];
}

export async function updateDeviceCode(id: string, data: Partial<typeof deviceCodes.$inferInsert>): Promise<DeviceCode> {
  const rows = await getDb().update(deviceCodes).set(data).where(eq(deviceCodes.id, id)).returning();
  return rows[0];
}
