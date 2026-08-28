import { NextResponse } from "next/server";
import {
  accessCookieOptions,
  accessCookieValue,
  isAuthRequired,
  verifyAccessToken,
  ACCESS_COOKIE,
} from "@/lib/shim-sham/auth";
import { MAX_REQUEST_BODY_BYTES } from "@/lib/shim-sham/patch";

export async function POST(request: Request) {
  if (!isAuthRequired()) {
    return NextResponse.json({ ok: true });
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && Number.parseInt(contentLength, 10) > MAX_REQUEST_BODY_BYTES) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const token =
    rawBody &&
    typeof rawBody === "object" &&
    "token" in rawBody &&
    typeof rawBody.token === "string"
      ? rawBody.token
      : null;

  if (!token || !verifyAccessToken(token)) {
    return NextResponse.json({ error: "Invalid access token" }, { status: 401 });
  }

  const cookieValue = accessCookieValue();
  if (!cookieValue) {
    return NextResponse.json({ error: "Auth is not configured" }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, cookieValue, accessCookieOptions());
  return response;
}
