import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Kiểm tra lạc quan (optimistic check) theo khuyến nghị của Next 16: chỉ nhìn
 * cookie để chuyển hướng sớm, KHÔNG coi đây là lớp phân quyền. Việc xác thực
 * thật nằm ở lib/auth/session.ts và được gọi trong từng server component.
 */
const PROTECTED_PREFIXES = [
  "/discover",
  "/matches",
  "/courts",
  "/ranking",
  "/profile",
  "/chat",
  "/notifications",
  "/history",
  "/ratings",
  "/settings",
  "/onboarding",
];

const AUTH_ROUTES = ["/login", "/register"];

function hasSessionCookie(request: NextRequest): boolean {
  return (
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token")
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = hasSessionCookie(request);

  if (
    !signedIn &&
    PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (signedIn && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/discover", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|favicon.ico).*)"],
};
