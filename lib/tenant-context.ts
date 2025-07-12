// Multi-tenant context utilities for data isolation

export interface TenantContext {
  organizationId?: number;
  isSystemAdmin: boolean;
  userId?: string;
}

// Check if a user has system admin privileges
export function isSystemAdmin(userRoles: any[]): boolean {
  console.log(
    "Checking system admin status for roles:",
    JSON.stringify(userRoles, null, 2),
  );

  const isAdmin =
    userRoles?.some(
      (userRole) =>
        userRole.roles?.name?.toLowerCase().includes("system") ||
        userRole.roles?.name?.toLowerCase().includes("superuser") ||
        userRole.role?.name?.toLowerCase().includes("system") ||
        userRole.role?.name?.toLowerCase().includes("superuser"),
    ) || false;

  console.log("Is system admin:", isAdmin);
  return isAdmin;
}

// Get tenant context from user data
export function getTenantContext(user: any): TenantContext {
  const isSystemUser = isSystemAdmin(user?.user_roles || user?.userRoles || []);

  return {
    organizationId: isSystemUser ? undefined : user?.organizationid,
    isSystemAdmin: isSystemUser,
    userId: user?.id,
  };
}

// Apply tenant filtering to database queries
export function applyTenantFilter(
  context: TenantContext,
  baseFilter: any = {},
) {
  if (context.isSystemAdmin) {
    // System admins can see all data
    return baseFilter;
  }

  if (context.organizationId) {
    // Regular users can only see data from their organization
    return {
      ...baseFilter,
      organizationId: context.organizationId,
    };
  }

  // If no organization, return impossible filter (no data)
  return {
    ...baseFilter,
    organizationId: -1, // No organization has ID -1
  };
}

// Apply tenant filtering for user-based queries
export function applyUserTenantFilter(
  context: TenantContext,
  baseFilter: any = {},
) {
  if (context.isSystemAdmin) {
    // System admins can see all users
    return baseFilter;
  }

  if (context.organizationId) {
    // Regular users can only see users from their organization
    return {
      ...baseFilter,
      organizationid: context.organizationId,
    };
  }

  // If no organization, return impossible filter
  return {
    ...baseFilter,
    organizationid: -1,
  };
}
