import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Minimal middleware to allow all requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for api, _next/static, _next/image, favicon.ico
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
