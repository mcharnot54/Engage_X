const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixOrganizations() {
  console.log("🏢 Fixing organizations data...");

  try {
    // Delete existing organizations and related data
    console.log("Removing existing organizations...");
    await prisma.userRole.deleteMany({});
    await prisma.rolePermission.deleteMany({});
    await prisma.role.deleteMany({ where: { isSystemRole: false } });
    await prisma.user.updateMany({
      where: { organizationId: { not: null } },
      data: { organizationId: null },
    });
    await prisma.facility.deleteMany({});
    await prisma.organization.deleteMany({});

    console.log("Creating new organizations...");

    // Create the correct organizations
    const organizations = [
      { id: 1, name: "Default Org", code: "DEFAULT" },
      { id: 2, name: "DigiKey", code: "DK" },
      { id: 4, name: "Continuum", code: "CT" },
    ];

    for (const org of organizations) {
      const organization = await prisma.organization.create({
        data: {
          name: org.name,
          code: org.code,
        },
      });
      console.log(
        `✅ Created organization: ${organization.name} (${organization.code})`,
      );

      // Create default roles for each organization
      const permissions = await prisma.permission.findMany();

      // Create Organization Admin role
      const adminRole = await prisma.role.create({
        data: {
          name: "Organization Admin",
          description: "Full administrative access within organization",
          organizationId: organization.id,
          isSystemRole: false,
        },
      });

      // Give admin role all non-system permissions
      const adminPermissions = permissions.filter(
        (p) =>
          !p.name.includes("manage_system") &&
          !p.name.includes("manage_organizations"),
      );

      for (const permission of adminPermissions) {
        await prisma.rolePermission.create({
          data: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        });
      }

      // Create Manager role
      const managerRole = await prisma.role.create({
        data: {
          name: "Manager",
          description: "Management access within organization",
          organizationId: organization.id,
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

      for (const permission of managerPermissions) {
        await prisma.rolePermission.create({
          data: {
            roleId: managerRole.id,
            permissionId: permission.id,
          },
        });
      }

      // Create Observer role
      const observerRole = await prisma.role.create({
        data: {
          name: "Observer",
          description: "Read-only access within organization",
          organizationId: organization.id,
          isSystemRole: false,
        },
      });

      // Give observer role only view permissions
      const observerPermissions = permissions.filter(
        (p) =>
          p.name.includes("view_") || p.name.includes("create_observations"),
      );

      for (const permission of observerPermissions) {
        await prisma.rolePermission.create({
          data: {
            roleId: observerRole.id,
            permissionId: permission.id,
          },
        });
      }

      console.log(`  ✅ Created roles for ${organization.name}`);
    }

    // Assign users to Default Org
    const defaultOrg = await prisma.organization.findFirst({
      where: { code: "DEFAULT" },
    });

    const regularUsers = await prisma.user.findMany({
      where: {
        employeeId: { not: { startsWith: "SYSTEM" } },
      },
    });

    for (const user of regularUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: { organizationId: defaultOrg.id },
      });
      console.log(`  ✅ Assigned ${user.name} to Default Org`);
    }

    // Assign roles to users in Default Org
    const adminRole = await prisma.role.findFirst({
      where: { name: "Organization Admin", organizationId: defaultOrg.id },
    });
    const managerRole = await prisma.role.findFirst({
      where: { name: "Manager", organizationId: defaultOrg.id },
    });
    const observerRole = await prisma.role.findFirst({
      where: { name: "Observer", organizationId: defaultOrg.id },
    });

    if (regularUsers.length > 0) {
      await prisma.userRole.create({
        data: {
          userId: regularUsers[0].id,
          roleId: adminRole.id,
          organizationId: defaultOrg.id,
        },
      });
      console.log(
        `  ✅ Assigned ${regularUsers[0].name} as Organization Admin`,
      );
    }

    if (regularUsers.length > 1) {
      await prisma.userRole.create({
        data: {
          userId: regularUsers[1].id,
          roleId: managerRole.id,
          organizationId: defaultOrg.id,
        },
      });
      console.log(`  ✅ Assigned ${regularUsers[1].name} as Manager`);
    }

    if (regularUsers.length > 2) {
      await prisma.userRole.create({
        data: {
          userId: regularUsers[2].id,
          roleId: observerRole.id,
          organizationId: defaultOrg.id,
        },
      });
      console.log(`  ✅ Assigned ${regularUsers[2].name} as Observer`);
    }

    console.log("🎉 Organizations fixed successfully!");
  } catch (error) {
    console.error("❌ Error fixing organizations:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOrganizations().catch(console.error);
