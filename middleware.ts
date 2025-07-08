import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  const publicRoutes = ["/", "/login", "/handler", "/api/public"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for Stack Auth session cookie
  const stackSessionCookie = request.cookies.get("stack-session");

  if (!stackSessionCookie?.value) {
    // No session found, redirect to login
    return NextResponse.redirect(new URL("/handler/sign-in", request.url));
  }

  // Session exists, allow access
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
