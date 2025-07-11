const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function assignUserRoles() {
  console.log("👥 Assigning roles to users...");

  try {
    const users = await prisma.user.findMany({
      where: {
        organizationId: { not: null },
      },
    });

    const organization = await prisma.organization.findFirst();
    const adminRole = await prisma.role.findFirst({
      where: { name: "Organization Admin", organizationId: organization.id },
    });
    const managerRole = await prisma.role.findFirst({
      where: { name: "Manager", organizationId: organization.id },
    });
    const observerRole = await prisma.role.findFirst({
      where: { name: "Observer", organizationId: organization.id },
    });

    // Assign John Smith as Admin
    if (users.length > 0) {
      await prisma.userRole.create({
        data: {
          userId: users[0].id,
          roleId: adminRole.id,
          organizationId: organization.id,
        },
      });
      console.log(`✅ Assigned ${users[0].name} as Organization Admin`);
    }

    // Assign Sarah Johnson as Manager
    if (users.length > 1) {
      await prisma.userRole.create({
        data: {
          userId: users[1].id,
          roleId: managerRole.id,
          organizationId: organization.id,
        },
      });
      console.log(`✅ Assigned ${users[1].name} as Manager`);
    }

    // Assign Michael Brown as Observer
    if (users.length > 2) {
      await prisma.userRole.create({
        data: {
          userId: users[2].id,
          roleId: observerRole.id,
          organizationId: organization.id,
        },
      });
      console.log(`✅ Assigned ${users[2].name} as Observer`);
    }

    console.log("🎉 User roles assigned successfully!");
  } catch (error) {
    console.error("❌ Error assigning user roles:", error);
  } finally {
    await prisma.$disconnect();
  }
}

assignUserRoles().catch(console.error);
