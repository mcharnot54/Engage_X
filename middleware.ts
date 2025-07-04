import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "./stack";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  const publicRoutes = ["/login", "/handler", "/api/public"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If Stack Auth is not configured, allow access (dev mode)
  if (!stackServerApp) {
    console.warn(
      "Stack Auth not configured - allowing all access for development",
    );
    return NextResponse.next();
  }

  // Check authentication for protected routes
  const user = await stackServerApp.getUser({ or: "return-undefined" });

  if (!user) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL("/handler/sign-in", request.url));
  }

  // Allow authenticated users to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
