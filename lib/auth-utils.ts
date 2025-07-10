// Multi-tenant authentication utilities
// Integrates with the new organization-based access control

import {
  getTenantContext,
  getUserPermissions,
  hasPermission as checkPermission,
} from "./tenant-utils";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: number | null;
  isSystemSuperuser: boolean;
}

// Placeholder for session management - integrate with your auth provider
export async function getCurrentUserId(): Promise<string | null> {
  // TODO: Integrate with your authentication provider (NextAuth, Auth0, etc.)
  // For now, return null since authentication is disabled
  return null;
}

export async function getCurrentUser(): Promise<User | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const userPermissions = await getUserPermissions(userId);
  if (!userPermissions) return null;

  // Get user details from database
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email || "",
    role: user.role || "user",
    organizationId: user.organizationId,
    isSystemSuperuser: userPermissions.isSystemSuperuser,
  };
}

export async function hasRole(
  roleName: string,
  organizationId?: number,
): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  const userPermissions = await getUserPermissions(userId);
  if (!userPermissions) return false;

  // Check if user has the specified role
  return userPermissions.roles.some((role) => {
    if (role.name !== roleName) return false;

    // If organizationId is specified, check that the role belongs to that organization
    if (organizationId !== undefined) {
      return role.organizationId === organizationId || role.isSystemRole;
    }

    return true;
  });
}

export async function hasPermission(
  permission: string,
  organizationId?: number,
): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  return await checkPermission(userId, permission, organizationId);
}

export async function requirePermission(
  permission: string,
  organizationId?: number,
): Promise<void> {
  const hasPermissionResult = await hasPermission(permission, organizationId);
  if (!hasPermissionResult) {
    throw new Error(`Access denied: Missing permission '${permission}'`);
  }
}

export async function getCurrentUserTenantContext() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  return await getTenantContext(userId);
}

// Helper function for API routes to check organization access
export async function validateOrganizationAccess(
  organizationId: number,
): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  const tenantContext = await getTenantContext(userId);
  if (!tenantContext) return false;

  return tenantContext.allowedOrganizations.includes(organizationId);
}

// Helper to get user's primary organization ID
export async function getCurrentUserOrganizationId(): Promise<number | null> {
  const user = await getCurrentUser();
  return user?.organizationId || null;
}
