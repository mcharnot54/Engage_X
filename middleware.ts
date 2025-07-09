import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Temporarily disable all middleware logic to isolate the issue
  console.log(
    `[Middleware] DISABLED - Allowing all routes: ${request.nextUrl.pathname}`,
  );
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and API routes
     */
    "/((?!api|_next|favicon.ico|public).*)",
  ],
};
