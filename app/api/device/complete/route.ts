import { NextRequest, NextResponse } from "next/server";
import { getSession, ensureDbUser } from "@/lib/auth";
import { getDeviceCodeByUserCode, updateDeviceCode } from "@/lib/db";
import { generateApiKey } from "@/lib/device-code";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { userCode } = await request.json();
  if (!userCode) {
    return NextResponse.json({ error: "userCode is required" }, { status: 400 });
  }

  const record = await getDeviceCodeByUserCode(userCode.toUpperCase());

  if (!record || record.status !== "pending" || new Date() > record.expiresAt) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 404 });
  }

  await ensureDbUser({ userId: session.user.id, email: session.user.email });

  const apiKey = generateApiKey();

  await updateDeviceCode(record.id, {
    status: "authorized",
    userId: session.user.id,
    apiKey,
  });

  return NextResponse.json({ success: true });
}
