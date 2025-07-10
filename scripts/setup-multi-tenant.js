const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function setupMultiTenant() {
  console.log("Setting up multi-tenant SaaS structure...");

  try {
    // Check if the migration has been applied
    const organizations = await prisma.organization.findMany();
    console.log(`Found ${organizations.length} organizations`);

    // Create default roles for each existing organization
    for (const org of organizations) {
      console.log(`Creating default roles for organization: ${org.name}`);

      // Check if roles already exist for this organization
      const existingRoles = await prisma.role.findMany({
        where: { organizationId: org.id },
      });

      if (existingRoles.length > 0) {
        console.log(`  Roles already exist for ${org.name}, skipping...`);
        continue;
      }

      // Get all permissions
      const permissions = await prisma.permission.findMany();

      // Create Organization Admin role
      const adminRole = await prisma.role.create({
        data: {
          name: "Organization Admin",
          description: "Full administrative access within organization",
          organizationId: org.id,
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
          organizationId: org.id,
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
          organizationId: org.id,
          isSystemRole: false,
        },
      });

      // Give observer role only view permissions
      const observerPermissions = permissions.filter(
        (p) =>
          p.name.includes("view_") || p.name.includes("create_observations"),
      );

      await prisma.rolePermission.createMany({
        data: observerPermissions.map((permission) => ({
          roleId: observerRole.id,
          permissionId: permission.id,
        })),
      });

      console.log(`  Created roles for ${org.name}: Admin, Manager, Observer`);
    }

    // Assign all existing users to their organization's default Observer role
    const users = await prisma.user.findMany({
      where: {
        organizationId: { not: null },
      },
    });

    for (const user of users) {
      // Check if user already has roles assigned
      const existingUserRoles = await prisma.userRole.findMany({
        where: { userId: user.id },
      });

      if (existingUserRoles.length > 0) {
        console.log(
          `  User ${user.name} already has roles assigned, skipping...`,
        );
        continue;
      }

      // Find the Observer role for user's organization
      const observerRole = await prisma.role.findFirst({
        where: {
          name: "Observer",
          organizationId: user.organizationId,
        },
      });

      if (observerRole) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: observerRole.id,
            organizationId: user.organizationId,
          },
        });
        console.log(`  Assigned Observer role to ${user.name}`);
      }
    }

    // Create a sample System Superuser (if needed)
    const systemSuperuserRole = await prisma.role.findFirst({
      where: {
        name: "System Superuser",
        isSystemRole: true,
      },
    });

    if (systemSuperuserRole) {
      // Check if we have a system superuser
      const systemUsers = await prisma.userRole.findMany({
        where: { roleId: systemSuperuserRole.id },
      });

      if (systemUsers.length === 0) {
        console.log("Creating sample System Superuser...");

        // Create a sample system superuser
        const systemUser = await prisma.user.create({
          data: {
            employeeId: "SYSTEM001",
            name: "System Administrator",
            email: "admin@system.com",
            role: "System Superuser",
            organizationId: null, // System users don't belong to any specific organization
          },
        });

        await prisma.userRole.create({
          data: {
            userId: systemUser.id,
            roleId: systemSuperuserRole.id,
            organizationId: null,
          },
        });

        console.log(
          "  Created System Administrator user with superuser privileges",
        );
      }
    }

    console.log("\n✅ Multi-tenant setup completed successfully!");
    console.log("\nNext steps:");
    console.log(
      "1. Update your authentication system to use organization-based login",
    );
    console.log("2. Apply tenant isolation middleware to your routes");
    console.log("3. Update API routes to use tenant-aware database operations");
    console.log("4. Test the multi-tenant structure with different user roles");
  } catch (error) {
    console.error("Error setting up multi-tenant structure:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupMultiTenant().catch((error) => {
  console.error("Setup failed:", error);
  process.exit(1);
});
