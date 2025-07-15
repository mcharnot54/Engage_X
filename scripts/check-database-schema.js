const { PrismaClient } = require("@prisma/client");

async function checkDatabase() {
  const prisma = new PrismaClient();

  try {
    console.log("Checking database schema...\n");

    // Check if key tables exist
    const tables = [
      "users",
      "organizations",
      "facilities",
      "departments",
      "areas",
      "standards",
      "observations",
      "roles",
      "permissions",
      "user_roles",
      "role_permissions",
      "delay_reasons",
      "observation_reasons",
      "goals",
    ];

    for (const table of tables) {
      try {
        const result =
          await prisma.$queryRaw`SELECT COUNT(*) FROM ${prisma.$raw(table)}`;
        console.log(`✓ ${table}: ${result[0].count} records`);
      } catch (error) {
        console.log(
          `✗ ${table}: Table does not exist or error: ${error.message}`,
        );
      }
    }

    // Check specific fields that might be missing
    console.log("\nChecking User table fields...");
    try {
      const users = await prisma.user.findFirst({
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
          department: true,
          role: true,
          roleId: true,
          organizationid: true,
          startDate: true,
          isNewEmployee: true,
          observationGoalPerMonth: true,
          userType: true,
        },
      });
      console.log("✓ User table has expected fields");
    } catch (error) {
      console.log(`✗ User table missing fields: ${error.message}`);
    }
  } catch (error) {
    console.error("Database connection error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase().catch(console.error);
