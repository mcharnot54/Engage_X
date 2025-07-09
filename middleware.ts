import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // For now, allow all requests to pass through
  // In the future, you can add authentication logic here
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
