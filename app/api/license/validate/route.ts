import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, ensureDbUser, unauthorized } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser(request);
  if (!authUser) return unauthorized();

  const user = await ensureDbUser(authUser);

  const isActive =
    user.subscriptionStatus === "active" ||
    user.subscriptionStatus === "trialing";

  return NextResponse.json({
    valid: isActive,
    status: user.subscriptionStatus,
    email: user.email,
    subscriptionExpiresAt: user.subscriptionExpiresAt?.toISOString(),
    referralCode: user.referralCode,
    message: isActive
      ? undefined
      : "No active subscription. Visit https://thedevhype.online/pricing",
  });
}
