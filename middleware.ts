import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Allow public routes and static assets
    const publicRoutes = [
      "/",
      "/login",
      "/handler",
      "/api/public",
      "/_next",
      "/favicon.ico",
      "/public",
    ];

    const isPublicRoute = publicRoutes.some((route) =>
      pathname.startsWith(route),
    );

    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Check if Stack Auth is properly configured
    const hasStackConfig =
      process.env.NEXT_PUBLIC_STACK_PROJECT_ID &&
      process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY &&
      process.env.STACK_SECRET_SERVER_KEY;

    // If Stack Auth is not configured, allow access for now
    if (!hasStackConfig) {
      console.warn("Stack Auth not configured - allowing access to all routes");
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
  } catch (error) {
    // If middleware fails, log error and allow request to continue
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|api/public).*)"],
};
