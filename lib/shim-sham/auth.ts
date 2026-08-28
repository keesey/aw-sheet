import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ACCESS_COOKIE = "shim-sham-access";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function getAccessToken(): string | null {
  const token = process.env.SHIM_SHAM_ACCESS_TOKEN?.trim();
  return token || null;
}

export function isAuthRequired(): boolean {
  return getAccessToken() !== null;
}

function expectedCookieValue(): string | null {
  const token = getAccessToken();
  if (!token) return null;
  const secret = process.env.SHIM_SHAM_COOKIE_SECRET?.trim() || token;
  return createHmac("sha256", secret).update(token).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  try {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    if (left.length !== right.length) return false;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export function isAuthenticatedCookie(cookie: string | undefined): boolean {
  const expected = expectedCookieValue();
  if (!expected) return true;
  if (!cookie) return false;
  return safeEqual(cookie, expected);
}

/** Used by Server Actions; throws when auth is required and the cookie is missing. */
export async function assertAuthenticated(): Promise<void> {
  if (!isAuthRequired()) return;
  const cookieStore = await cookies();
  if (!isAuthenticatedCookie(cookieStore.get(ACCESS_COOKIE)?.value)) {
    throw new Error("Unauthorized");
  }
}

/** Set the access cookie after a successful unlock. */
export async function setAccessCookie(): Promise<void> {
  const cookieValue = accessCookieValue();
  if (!cookieValue) {
    throw new Error("Auth is not configured");
  }
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, cookieValue, accessCookieOptions());
}

export function verifyAccessToken(submitted: string): boolean {
  const token = getAccessToken();
  if (!token) return true;
  return safeEqual(submitted.trim(), token);
}

export function accessCookieValue(): string | null {
  return expectedCookieValue();
}

export function accessCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}
