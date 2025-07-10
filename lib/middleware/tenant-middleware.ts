import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentUserId,
  validateOrganizationAccess,
  getCurrentUserTenantContext,
} from "../auth-utils";

export interface TenantMiddlewareConfig {
  // Paths that require organization access validation
  organizationProtectedPaths: string[];
  // Paths that require system superuser access
  systemOnlyPaths: string[];
  // Paths that are public (no authentication required)
  publicPaths: string[];
}

const defaultConfig: TenantMiddlewareConfig = {
  organizationProtectedPaths: [
    "/api/standards",
    "/api/observations",
    "/api/facilities",
    "/api/departments",
    "/api/areas",
    "/dashboard",
    "/standards",
    "/observation-form",
    "/reporting",
  ],
  systemOnlyPaths: [
    "/api/organizations",
    "/admin/organizations",
    "/admin/users",
  ],
  publicPaths: ["/login", "/api/auth", "/", "/status"],
};

/**
 * Middleware to enforce tenant isolation and organization-based access control
 */
export async function tenantMiddleware(
  request: NextRequest,
  config: TenantMiddlewareConfig = defaultConfig,
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  // Skip middleware for public paths
  if (config.publicPaths.some((path) => pathname.startsWith(path))) {
    return null; // Continue to next middleware/handler
  }

  // Get current user
  const userId = await getCurrentUserId();

  // If no user is authenticated, redirect to login
  if (!userId) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Get user's tenant context
  const tenantContext = await getCurrentUserTenantContext();
  if (!tenantContext) {
    return NextResponse.json(
      { error: "Invalid user context" },
      { status: 403 },
    );
  }

  // Check system-only paths
  if (config.systemOnlyPaths.some((path) => pathname.startsWith(path))) {
    if (!tenantContext.isSystemSuperuser) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "System superuser access required" },
          { status: 403 },
        );
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Handle organization-specific API routes
  if (
    pathname.startsWith("/api/") &&
    config.organizationProtectedPaths.some((path) => pathname.startsWith(path))
  ) {
    // Extract organization ID from URL if present
    const orgIdMatch = pathname.match(/\/organizations\/(\d+)/);
    if (orgIdMatch) {
      const organizationId = parseInt(orgIdMatch[1]);

      // Validate that user can access this organization
      if (!tenantContext.allowedOrganizations.includes(organizationId)) {
        return NextResponse.json(
          { error: "Access denied to this organization" },
          { status: 403 },
        );
      }
    } else if (
      !tenantContext.isSystemSuperuser &&
      !tenantContext.organizationId
    ) {
      // Regular users must belong to an organization
      return NextResponse.json(
        { error: "No organization access" },
        { status: 403 },
      );
    }
  }

  // Add tenant context to request headers for use in API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", userId);
  requestHeaders.set("x-tenant-context", JSON.stringify(tenantContext));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Helper to extract tenant context from request headers (for use in API routes)
 */
export function getTenantContextFromRequest(request: NextRequest): {
  userId: string | null;
  tenantContext: any | null;
} {
  const userId = request.headers.get("x-user-id");
  const tenantContextHeader = request.headers.get("x-tenant-context");

  let tenantContext = null;
  if (tenantContextHeader) {
    try {
      tenantContext = JSON.parse(tenantContextHeader);
    } catch (error) {
      console.error("Error parsing tenant context:", error);
    }
  }

  return { userId, tenantContext };
}

/**
 * API route wrapper that automatically applies tenant filtering
 */
export function withTenantIsolation<T extends any[]>(
  handler: (
    request: NextRequest,
    tenantContext: any,
    ...args: T
  ) => Promise<NextResponse>,
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const { tenantContext } = getTenantContextFromRequest(request);

    if (!tenantContext) {
      return NextResponse.json(
        { error: "Tenant context required" },
        { status: 400 },
      );
    }

    return handler(request, tenantContext, ...args);
  };
}
