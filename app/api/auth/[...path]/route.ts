import { NextRequest } from "next/server";
import { getAuth } from "@/lib/auth/server";

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { GET } = getAuth().handler();
  return GET(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { POST } = getAuth().handler();
  return POST(request, context);
}
