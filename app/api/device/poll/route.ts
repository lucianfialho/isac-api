import { NextRequest, NextResponse } from "next/server";
import { getDeviceCodeById } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { deviceCode } = await request.json();

  if (!deviceCode) {
    return NextResponse.json({ error: "deviceCode is required" }, { status: 400 });
  }

  const record = await getDeviceCodeById(deviceCode);

  if (!record || new Date() > record.expiresAt) {
    return NextResponse.json({ status: "expired" });
  }

  if (record.status === "authorized" && record.apiKey) {
    return NextResponse.json({
      status: "authorized",
      apiKey: record.apiKey,
      userId: record.userId,
    });
  }

  return NextResponse.json({ status: "pending" });
}
