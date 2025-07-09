import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  try {
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

    // Safe environment check for Vercel
    let hasStackConfig = false;
    try {
      hasStackConfig = !!(
        process.env.NEXT_PUBLIC_STACK_PROJECT_ID &&
        process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY &&
        process.env.STACK_SECRET_SERVER_KEY
      );
    } catch (envError) {
      console.error("Environment variable access error:", envError);
      return NextResponse.next();
    }

    // If Stack Auth is not configured, allow access
    if (!hasStackConfig) {
      return NextResponse.next();
    }

    // Safe cookie check for Vercel
    let stackSessionCookie;
    try {
      stackSessionCookie = request.cookies.get("stack-session");
    } catch (cookieError) {
      console.error("Cookie access error:", cookieError);
      return NextResponse.next();
    }

    if (!stackSessionCookie?.value) {
      // No session found, redirect to login
      try {
        const signInUrl = new URL("/handler/sign-in", request.url);
        return NextResponse.redirect(signInUrl);
      } catch (redirectError) {
        console.error("Redirect error:", redirectError);
        return NextResponse.next();
      }
    }

    // Session exists, allow access
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware fatal error:", error);
    // On any error, allow access to prevent blocking the entire app
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
