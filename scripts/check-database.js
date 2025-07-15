const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log("🔍 Checking database contents...");

  try {
    // Check organizations
    const organizations = await prisma.organization.findMany();
    console.log(`📊 Organizations: ${organizations.length}`);
    organizations.forEach((org) => {
      console.log(`  - ${org.name} (${org.code})`);
    });

    // Check roles
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            rolePermissions: true,
            user_roles: true,
          },
        },
      },
    });
    console.log(`\n🎭 Roles: ${roles.length}`);
    roles.forEach((role) => {
      console.log(
        `  - ${role.name} (${role.description || "No description"}) - ${role._count.rolePermissions} permissions, ${role._count.user_roles} users`,
      );
    });

    // Check permissions
    const permissions = await prisma.permission.findMany();
    console.log(`\n🔐 Permissions: ${permissions.length}`);
    permissions.slice(0, 10).forEach((perm) => {
      console.log(`  - ${perm.name} (${perm.module}.${perm.action})`);
    });
    if (permissions.length > 10) {
      console.log(`  ... and ${permissions.length - 10} more`);
    }

    // Check role permissions
    const rolePermissions = await prisma.rolePermission.findMany({
      include: {
        role: true,
        permission: true,
      },
    });
    console.log(`\n🔗 Role Permissions: ${rolePermissions.length}`);

    // Check users
    const users = await prisma.user.findMany({
      include: {
        user_roles: {
          include: {
            roles: true,
          },
        },
      },
    });
    console.log(`\n👥 Users: ${users.length}`);
    users.forEach((user) => {
      const roleNames = user.user_roles.map((ur) => ur.roles.name).join(", ");
      console.log(
        `  - ${user.name} (${user.employeeId}) - Roles: ${roleNames || "None"}`,
      );
    });

    // Check facilities
    const facilities = await prisma.facility.findMany();
    console.log(`\n🏭 Facilities: ${facilities.length}`);

    // Check standards
    const standards = await prisma.standard.findMany();
    console.log(`📋 Standards: ${standards.length}`);

    // Check goals
    const goals = await prisma.goal.findMany();
    console.log(`🎯 Goals: ${goals.length}`);

    console.log("\n✅ Database check completed successfully!");
  } catch (error) {
    console.error("❌ Error checking database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase().catch(console.error);
