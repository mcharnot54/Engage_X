import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Allow all static assets and API routes that should be public
    if (
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/api/public") ||
      pathname.includes(".") ||
      pathname === "/favicon.ico"
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

    // Check if Stack Auth is properly configured (more defensive)
    let hasStackConfig = false;
    try {
      hasStackConfig = !!(
        process.env.NEXT_PUBLIC_STACK_PROJECT_ID &&
        process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY &&
        process.env.STACK_SECRET_SERVER_KEY
      );
    } catch (envError) {
      console.warn("Error checking environment variables:", envError);
      return NextResponse.next();
    }

    // If Stack Auth is not configured or in development, allow access
    if (!hasStackConfig || process.env.NODE_ENV === "development") {
      return NextResponse.next();
    }

    // Check for Stack Auth session cookie
    let stackSessionCookie;
    try {
      stackSessionCookie = request.cookies.get("stack-session");
    } catch (cookieError) {
      console.warn("Error reading cookies:", cookieError);
      return NextResponse.next();
    }

    if (!stackSessionCookie?.value) {
      // No session found, redirect to login
      try {
        const signInUrl = new URL("/handler/sign-in", request.url);
        return NextResponse.redirect(signInUrl);
      } catch (redirectError) {
        console.warn("Error creating redirect URL:", redirectError);
        return NextResponse.next();
      }
    }

    // Session exists, allow access
    return NextResponse.next();
  } catch (error) {
    // If middleware fails completely, log error and allow request to continue
    if (process.env.NODE_ENV === "production") {
      console.error("Middleware error:", error);
    }
    return NextResponse.next();
  }
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
