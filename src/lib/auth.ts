import { createHmac } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

// Логин/пароль админки берутся из переменных окружения (НЕ хранятся в коде).
// В .env локально / в Environment Variables на Vercel:
//   AUTH_ADMIN_EMAIL=ваш_email
//   AUTH_ADMIN_PASSWORD=ваш_пароль
const ADMIN_EMAIL = process.env.AUTH_ADMIN_EMAIL || "";
const ADMIN_PASSWORD = process.env.AUTH_ADMIN_PASSWORD || "";
const SECRET = process.env.AUTH_SECRET || "portfolio_secret_key_anweradev_2024";

export interface TokenPayload {
  email: string;
  exp: number;
}

export function createToken(email: string): string {
  const payload: TokenPayload = {
    email,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(payloadB64).digest("hex");
  return `${payloadB64}.${sig}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return null;
    const expectedSig = createHmac("sha256", SECRET).update(payloadB64).digest("hex");
    if (sig !== expectedSig) return null;
    const payloadStr = Buffer.from(payloadB64, "base64url").toString();
    const payload: TokenPayload = JSON.parse(payloadStr);
    if (payload.exp < Date.now()) return null;
    if (payload.email !== ADMIN_EMAIL) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Извлекает токен из cookie или из заголовков (X-Auth-Token / Authorization: Bearer).
 * Заголовки нужны для окружений, где cookie не сохраняются (iframe-превью, прокси).
 */
export function extractToken(req: NextRequest): string | null {
  const fromCookie = req.cookies.get("admin_token")?.value;
  const fromHeader =
    req.headers.get("x-auth-token") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    null;
  return fromCookie || fromHeader;
}

export function checkCredentials(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export async function getAdminFromCookies(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function isAdmin(): Promise<boolean> {
  const admin = await getAdminFromCookies();
  return !!admin;
}
