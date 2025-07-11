const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function updateUsersOrganization() {
  console.log("🔄 Updating user organization assignments...");

  try {
    const organization = await prisma.organization.findFirst();
    console.log(
      `Found organization: ${organization.name} (ID: ${organization.id})`,
    );

    const users = await prisma.user.findMany({
      where: {
        organizationId: null,
        id: { not: { startsWith: "SYSTEM" } }, // Don't update system users
      },
    });

    console.log(`Found ${users.length} users without organization`);

    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: { organizationId: organization.id },
      });
      console.log(`✅ Updated ${user.name} to belong to ${organization.name}`);
    }

    console.log("🎉 User organization assignments updated!");
  } catch (error) {
    console.error("❌ Error updating user organizations:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUsersOrganization().catch(console.error);
