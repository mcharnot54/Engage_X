import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {

}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and API routes
     */
    "/((?!api|_next|favicon.ico|public).*)",
  ],
};

