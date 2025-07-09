import { prisma } from "./prisma";

export async function getCurrentUser() {
  // Return null since no authentication is configured
  return null;
}

export async function getUserPermissions(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRole: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.userRole) {
      return [];
    }

    return user.userRole.permissions
      .filter((rp) => rp.granted)
      .map((rp) => rp.permission);
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return [];
  }
}

export async function hasPermission(
  userId: string,
  module: string,
  action: string,
) {
  const permissions = await getUserPermissions(userId);
  return permissions.some((p) => p.module === module && p.action === action);
}
