import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    console.log(`[Middleware] Processing: ${pathname}`);

    // Allow all static assets and API routes
    if (
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/api/") ||
      pathname.includes(".") ||
      pathname === "/favicon.ico" ||
      pathname.startsWith("/public/")
    ) {
      console.log(`[Middleware] Allowing static/API route: ${pathname}`);
      return NextResponse.next();
    }

    // Allow public routes
    const publicRoutes = ["/", "/login", "/handler"];
    const isPublicRoute = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    );

    if (isPublicRoute) {
      console.log(`[Middleware] Allowing public route: ${pathname}`);
      return NextResponse.next();
    }

    // Simple environment check - if any required env var is missing, allow access
    const hasStackConfig = !!(
      process.env.NEXT_PUBLIC_STACK_PROJECT_ID &&
      process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY &&
      process.env.STACK_SECRET_SERVER_KEY
    );

    console.log(`[Middleware] Stack config available: ${hasStackConfig}`);

    // If Stack Auth is not configured, allow access
    if (!hasStackConfig) {
      console.log(`[Middleware] No Stack config, allowing access: ${pathname}`);
      return NextResponse.next();
    }

    // Check for Stack Auth session cookie
    const stackSessionCookie = request.cookies.get("stack-session");
    console.log(
      `[Middleware] Session cookie exists: ${!!stackSessionCookie?.value}`,
    );

    if (!stackSessionCookie?.value) {
      // No session found, redirect to login
      console.log(`[Middleware] Redirecting to sign-in: ${pathname}`);
      const signInUrl = new URL("/handler/sign-in", request.url);
      return NextResponse.redirect(signInUrl);
    }

    // Session exists, allow access
    console.log(`[Middleware] Session found, allowing access: ${pathname}`);
    return NextResponse.next();
  } catch (error) {
    console.error(`[Middleware] Error processing ${pathname}:`, error);
    // On error, allow access to prevent blocking the entire app
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and API routes
     */
    "/((?!api|_next|favicon.ico|public).*)",
  ],
};
