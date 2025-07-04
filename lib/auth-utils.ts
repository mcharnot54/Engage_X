import { stackServerApp } from "../stack";
import { prisma } from "./prisma";

export async function syncUserWithDatabase(stackUser: any) {
  try {
    // Check if user already exists in our database
    let dbUser = await prisma.user.findUnique({
      where: { email: stackUser.primaryEmail || stackUser.id },
      include: { userRole: true },
    });

    // If user doesn't exist, create them
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: stackUser.id,
          employeeId: stackUser.id, // Use Stack ID as employee ID initially
          name:
            stackUser.displayName || stackUser.primaryEmail || "Unknown User",
          email: stackUser.primaryEmail,
          externalSource: "stack_auth",
          isActive: true,
        },
        include: { userRole: true },
      });
    } else {
      // Update existing user with latest info from Stack Auth
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          name: stackUser.displayName || dbUser.name,
          email: stackUser.primaryEmail || dbUser.email,
          lastSyncAt: new Date(),
        },
        include: { userRole: true },
      });
    }

    return dbUser;
  } catch (error) {
    console.error("Error syncing user with database:", error);
    return null;
  }
}

export async function getCurrentUser() {
  const stackUser = await stackServerApp.getUser({ or: "return-undefined" });

  if (!stackUser) {
    return null;
  }

  // Sync with our database and return the database user
  const dbUser = await syncUserWithDatabase(stackUser);
  return dbUser;
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
