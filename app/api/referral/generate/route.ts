import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, ensureDbUser, unauthorized } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser(request);
  if (!authUser) return unauthorized();

  const user = await ensureDbUser(authUser);

  return NextResponse.json({
    referralCode: user.referralCode,
    shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?ref=${user.referralCode}`,
  });
}
