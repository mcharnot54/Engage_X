const { PrismaClient } = require("@prisma/client");

async function testConnection() {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log("✅ Database connection successful");

    const orgCount = await prisma.organization.count();
    const obsCount = await prisma.observation.count();
    const userCount = await prisma.user.count();
    const facilityCount = await prisma.facility.count();
    const standardCount = await prisma.standard.count();

    console.log("📊 Data counts:");
    console.log(`  Organizations: ${orgCount}`);
    console.log(`  Facilities: ${facilityCount}`);
    console.log(`  Standards: ${standardCount}`);
    console.log(`  Users: ${userCount}`);
    console.log(`  Observations: ${obsCount}`);

    console.log("\n🎉 Your restored data is now accessible!");
  } catch (error) {
    console.error("❌ Database error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
