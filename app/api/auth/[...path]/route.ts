import { NextRequest } from "next/server";
import { getAuth } from "@/lib/auth/server";

export async function GET(request: NextRequest) {
  const { GET } = getAuth().handler();
  return GET(request);
}

export async function POST(request: NextRequest) {
  const { POST } = getAuth().handler();
  return POST(request);
}
