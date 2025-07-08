const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function syncUser() {
  try {
    // Create user for mdcharnot@continuumpmc.com
    const user = await prisma.user.upsert({
      where: {
        email: "mdcharnot@continuumpmc.com",
      },
      update: {
        name: "M.D. Charnot",
        isActive: true,
        lastSyncAt: new Date(),
        externalSource: "stack_auth",
      },
      create: {
        employeeId: "stack_auth_user_1",
        employeeNumber: "001",
        name: "M.D. Charnot",
        email: "mdcharnot@continuumpmc.com",
        department: "Operations",
        role: "User",
        isActive: true,
        externalSource: "stack_auth",
        lastSyncAt: new Date(),
      },
    });

    console.log("User synced successfully:", user);
  } catch (error) {
    console.error("Error syncing user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

syncUser();
