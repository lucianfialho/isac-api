import { NextResponse } from "next/server";
import { generateUserCode, generateDeviceCode } from "@/lib/device-code";
import { createDeviceCode } from "@/lib/db";

export async function POST() {
  const userCode = generateUserCode();
  const deviceCode = generateDeviceCode();

  await createDeviceCode({
    id: deviceCode,
    userCode,
    status: "pending",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  });

  return NextResponse.json({
    userCode,
    deviceCode,
    expiresIn: 300,
    interval: 5,
    verificationUri: `${process.env.NEXT_PUBLIC_APP_URL}/activate`,
  });
}
