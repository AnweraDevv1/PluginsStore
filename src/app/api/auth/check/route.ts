import { NextRequest, NextResponse } from "next/server";
import { extractToken, verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = extractToken(req);
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({ authenticated: true, email: payload.email });
}
