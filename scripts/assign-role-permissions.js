const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function assignRolePermissions() {
  console.log("🔗 Assigning permissions to organization roles...");

  try {
    // Get all permissions
    const permissions = await prisma.permission.findMany();
    console.log(`Found ${permissions.length} permissions`);

    // Get organization roles (excluding system roles)
    const orgRoles = await prisma.role.findMany({
      where: { isSystemRole: false },
      include: {
        rolePermissions: true,
      },
    });

    console.log(`Found ${orgRoles.length} organization roles`);

    for (const role of orgRoles) {
      console.log(`\nAssigning permissions to role: ${role.name}`);

      let permissionsToAssign = [];

      if (role.name === "Organization Admin") {
        // Give admin role all non-system permissions
        permissionsToAssign = permissions.filter(
          (p) =>
            !p.name.includes("manage_system") &&
            !p.name.includes("manage_organizations"),
        );
      } else if (role.name === "Manager") {
        // Give manager role management permissions
        permissionsToAssign = permissions.filter(
          (p) =>
            p.name.includes("manage_standards") ||
            p.name.includes("manage_observations") ||
            p.name.includes("view_") ||
            p.name.includes("create_observations"),
        );
      } else if (role.name === "Observer") {
        // Give observer role only view permissions
        permissionsToAssign = permissions.filter(
          (p) =>
            p.name.includes("view_") || p.name.includes("create_observations"),
        );
      }

      console.log(`  Will assign ${permissionsToAssign.length} permissions`);

      // Remove existing permissions first
      await prisma.rolePermission.deleteMany({
        where: { roleId: role.id },
      });

      // Add new permissions
      for (const permission of permissionsToAssign) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
        console.log(`    ✅ ${permission.name}`);
      }
    }

    console.log("\n🎉 Role permissions assigned successfully!");
  } catch (error) {
    console.error("❌ Error assigning role permissions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

assignRolePermissions().catch(console.error);
