"use client";

const STORAGE_KEY = "admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // ignore (e.g. sandboxed iframe without storage)
  }
}

export function clearToken() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Заголовки для авторизованных запросов (токен из localStorage). */
export function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { "X-Auth-Token": t } : {};
}
