import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/split",
  "/exercises",
  "/progress",
  "/profile",
  "/workout",
];

const AUTH_ROUTES = ["/login", "/signin"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const sessionCookie =
    req.cookies.get("better-auth.session_token") ??
    req.cookies.get("__Secure-better-auth.session_token");

  const isProtected = PROTECTED_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // No session → redirect to /signin
  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl));
  }

  // Already logged in → skip auth pages
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
