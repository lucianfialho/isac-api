import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "./auth/server";
import { getUserById, createUser } from "./db";
import { generateReferralCode } from "./referral";
import { getDb, schema } from "@/db";
import { eq } from "drizzle-orm";

/**
 * Gets the current session from Neon Auth.
 * Returns { user } or null.
 */
export async function getSession() {
  const { data } = await getAuth().getSession();
  return data;
}

/**
 * Gets the authenticated user from either:
 * 1. API key header (CLI: x-api-key or Authorization: Bearer isac_...)
 * 2. Neon Auth session (web/cookie)
 */
export async function getAuthUser(
  request: NextRequest
): Promise<{ userId: string; email: string } | null> {
  // Try API key first (CLI requests)
  const apiKeyHeader = request.headers.get("x-api-key");
  const authHeader = request.headers.get("authorization");
  const apiKey =
    apiKeyHeader ||
    (authHeader?.startsWith("Bearer isac_") ? authHeader.slice(7) : null);

  if (apiKey) {
    const rows = await getDb()
      .select()
      .from(schema.deviceCodes)
      .where(eq(schema.deviceCodes.apiKey, apiKey))
      .limit(1);

    const record = rows[0];
    if (record?.userId) {
      const user = await getUserById(record.userId);
      if (user) {
        return { userId: user.id, email: user.email };
      }
    }
    return null;
  }

  // Fall back to Neon Auth session
  try {
    const session = await getSession();
    if (session?.user) {
      return { userId: session.user.id, email: session.user.email };
    }
  } catch {
    // No session
  }

  return null;
}

/**
 * Ensures a user record exists in our DB.
 */
export async function ensureDbUser(userInfo: { userId: string; email: string }) {
  let user = await getUserById(userInfo.userId);

  if (!user) {
    const referralCode = generateReferralCode(userInfo.email);
    user = await createUser({
      id: userInfo.userId,
      email: userInfo.email,
      referralCode,
    });
  }

  return user;
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}
