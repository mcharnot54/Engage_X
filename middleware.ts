import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all static assets and API routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/public/")
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  const publicRoutes = ["/", "/login", "/handler"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Simple environment check - if any required env var is missing, allow access
  const hasStackConfig = !!(
    process.env.NEXT_PUBLIC_STACK_PROJECT_ID &&
    process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY &&
    process.env.STACK_SECRET_SERVER_KEY
  );

  // If Stack Auth is not configured, allow access
  if (!hasStackConfig) {
    return NextResponse.next();
  }

  // Check for Stack Auth session cookie
  const stackSessionCookie = request.cookies.get("stack-session");

  if (!stackSessionCookie?.value) {
    // No session found, redirect to login
    const signInUrl = new URL("/handler/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Session exists, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
