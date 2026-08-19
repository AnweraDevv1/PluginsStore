import { NextRequest, NextResponse } from "next/server";
import { checkCredentials, createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    if (!checkCredentials(email, password)) {
      return NextResponse.json({ error: "Неверные данные" }, { status: 401 });
    }

    const token = createToken(email);
    
    const res = NextResponse.json({ success: true, email, token });
    res.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
