import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface UserPermissions {
  userId: string;
  organizationId: number | null;
  isSystemSuperuser: boolean;
  permissions: string[];
  roles: Array<{
    id: number;
    name: string;
    organizationId: number | null;
    isSystemRole: boolean;
  }>;
}

export interface TenantContext {
  userId: string;
  organizationId: number | null;
  isSystemSuperuser: boolean;
  allowedOrganizations: number[];
}

/**
 * Get user's permissions and role information
 */
export async function getUserPermissions(
  userId: string,
): Promise<UserPermissions | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        organization: true,
      },
    });

    if (!user) {
      return null;
    }

    // Extract all permissions from user's roles
    const permissions = new Set<string>();
    const roles = user.userRoles.map((userRole) => {
      // Add all permissions from this role
      userRole.role.rolePermissions.forEach((rp) => {
        permissions.add(rp.permission.name);
      });

      return {
        id: userRole.role.id,
        name: userRole.role.name,
        organizationId: userRole.role.organizationId,
        isSystemRole: userRole.role.isSystemRole,
      };
    });

    // Check if user is a System Superuser
    const isSystemSuperuser = roles.some(
      (role) => role.isSystemRole && role.name === "System Superuser",
    );

    return {
      userId,
      organizationId: user.organizationId,
      isSystemSuperuser,
      permissions: Array.from(permissions),
      roles,
    };
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return null;
  }
}

/**
 * Get tenant context for a user (which organizations they can access)
 */
export async function getTenantContext(
  userId: string,
): Promise<TenantContext | null> {
  const userPermissions = await getUserPermissions(userId);

  if (!userPermissions) {
    return null;
  }

  // System Superuser can access all organizations
  if (userPermissions.isSystemSuperuser) {
    const allOrganizations = await prisma.organization.findMany({
      select: { id: true },
    });

    return {
      userId,
      organizationId: null, // System users don't belong to a specific org
      isSystemSuperuser: true,
      allowedOrganizations: allOrganizations.map((org) => org.id),
    };
  }

  // Regular users can only access their organization
  return {
    userId,
    organizationId: userPermissions.organizationId,
    isSystemSuperuser: false,
    allowedOrganizations: userPermissions.organizationId
      ? [userPermissions.organizationId]
      : [],
  };
}

/**
 * Check if user has permission to perform action on resource
 */
export async function hasPermission(
  userId: string,
  permission: string,
  organizationId?: number,
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);

  if (!userPermissions) {
    return false;
  }

  // System Superuser has all permissions
  if (userPermissions.isSystemSuperuser) {
    return true;
  }

  // Check if user has the specific permission
  if (!userPermissions.permissions.includes(permission)) {
    return false;
  }

  // If organizationId is specified, ensure user belongs to that organization
  if (
    organizationId !== undefined &&
    userPermissions.organizationId !== organizationId
  ) {
    return false;
  }

  return true;
}

/**
 * Filter query results based on user's organization access
 */
export function addTenantFilter(
  tenantContext: TenantContext,
  baseWhere: any = {},
): any {
  // System Superuser can see everything
  if (tenantContext.isSystemSuperuser) {
    return baseWhere;
  }

  // Regular users can only see data from their organization
  if (tenantContext.organizationId) {
    return {
      ...baseWhere,
      // For direct organization relations
      organizationId: tenantContext.organizationId,
    };
  }

  // If no organization, return filter that matches nothing
  return {
    ...baseWhere,
    organizationId: -1, // This will match no records
  };
}

/**
 * Filter query results for facility-based resources (Standards, etc.)
 */
export function addFacilityTenantFilter(
  tenantContext: TenantContext,
  baseWhere: any = {},
): any {
  // System Superuser can see everything
  if (tenantContext.isSystemSuperuser) {
    return baseWhere;
  }

  // Regular users can only see data from facilities in their organization
  if (tenantContext.organizationId) {
    return {
      ...baseWhere,
      facility: {
        organizationId: tenantContext.organizationId,
      },
    };
  }

  // If no organization, return filter that matches nothing
  return {
    ...baseWhere,
    facility: {
      organizationId: -1,
    },
  };
}

/**
 * Create default roles for a new organization
 */
export async function createDefaultRolesForOrganization(
  organizationId: number,
): Promise<void> {
  try {
    // Get all permissions
    const permissions = await prisma.permission.findMany();

    // Create Organization Admin role
    const adminRole = await prisma.role.create({
      data: {
        name: "Organization Admin",
        description: "Full administrative access within organization",
        organizationId,
        isSystemRole: false,
      },
    });

    // Give admin role all non-system permissions
    const adminPermissions = permissions.filter(
      (p) =>
        !p.name.includes("manage_system") &&
        !p.name.includes("manage_organizations"),
    );

    await prisma.rolePermission.createMany({
      data: adminPermissions.map((permission) => ({
        roleId: adminRole.id,
        permissionId: permission.id,
      })),
    });

    // Create Manager role
    const managerRole = await prisma.role.create({
      data: {
        name: "Manager",
        description: "Management access within organization",
        organizationId,
        isSystemRole: false,
      },
    });

    // Give manager role management permissions
    const managerPermissions = permissions.filter(
      (p) =>
        p.name.includes("manage_standards") ||
        p.name.includes("manage_observations") ||
        p.name.includes("view_") ||
        p.name.includes("create_observations"),
    );

    await prisma.rolePermission.createMany({
      data: managerPermissions.map((permission) => ({
        roleId: managerRole.id,
        permissionId: permission.id,
      })),
    });

    // Create Observer role
    const observerRole = await prisma.role.create({
      data: {
        name: "Observer",
        description: "Read-only access within organization",
        organizationId,
        isSystemRole: false,
      },
    });

    // Give observer role only view permissions
    const observerPermissions = permissions.filter(
      (p) => p.name.includes("view_") || p.name.includes("create_observations"),
    );

    await prisma.rolePermission.createMany({
      data: observerPermissions.map((permission) => ({
        roleId: observerRole.id,
        permissionId: permission.id,
      })),
    });

    console.log(`Created default roles for organization ${organizationId}`);
  } catch (error) {
    console.error("Error creating default roles:", error);
    throw error;
  }
}

/**
 * Assign role to user within an organization
 */
export async function assignRoleToUser(
  userId: string,
  roleId: number,
  organizationId: number,
): Promise<void> {
  try {
    await prisma.userRole.create({
      data: {
        userId,
        roleId,
        organizationId,
      },
    });
  } catch (error) {
    console.error("Error assigning role to user:", error);
    throw error;
  }
}

/**
 * Check if user can access specific organization
 */
export async function canAccessOrganization(
  userId: string,
  organizationId: number,
): Promise<boolean> {
  const tenantContext = await getTenantContext(userId);

  if (!tenantContext) {
    return false;
  }

  return tenantContext.allowedOrganizations.includes(organizationId);
}
