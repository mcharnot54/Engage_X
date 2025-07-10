const { PrismaClient } = require("@prisma/client");

async function fixDatabaseIssues() {
  console.log("🔧 Starting database issue fixes...");

  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set");
    console.log("Please configure your database connection:");
    console.log("1. Create a .env.local file in the project root");
    console.log('2. Add: DATABASE_URL="your-database-connection-string"');
    console.log(
      '3. For Neon: DATABASE_URL="postgresql://username:password@host/database?sslmode=require"',
    );
    return;
  }

  const prisma = new PrismaClient();

  try {
    // Test database connection
    console.log("🔍 Testing database connection...");
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Check if standards table exists and has notes column
    console.log("🔍 Checking standards table structure...");

    try {
      // Try to query standards to check if notes column exists
      const sampleStandard = await prisma.standard.findFirst({
        select: {
          id: true,
          name: true,
          notes: true,
        },
      });
      console.log("✅ Standards table with notes column exists");
    } catch (error) {
      if (error.message.includes("notes")) {
        console.log("🔧 Adding missing notes column to existing standards...");

        // Update existing standards that might not have notes
        await prisma.$executeRaw`
          UPDATE standards 
          SET notes = COALESCE(notes, 'No notes provided') 
          WHERE notes IS NULL OR notes = ''
        `;
        console.log("✅ Updated existing standards with default notes");
      } else {
        console.error("❌ Standards table issue:", error.message);
      }
    }

    // Check table counts
    console.log("🔍 Checking table data...");
    const counts = await Promise.all([
      prisma.organization.count(),
      prisma.facility.count(),
      prisma.department.count(),
      prisma.area.count(),
      prisma.standard.count(),
      prisma.user.count(),
    ]);

    console.log("📊 Current data counts:");
    console.log(`  Organizations: ${counts[0]}`);
    console.log(`  Facilities: ${counts[1]}`);
    console.log(`  Departments: ${counts[2]}`);
    console.log(`  Areas: ${counts[3]}`);
    console.log(`  Standards: ${counts[4]}`);
    console.log(`  Users: ${counts[5]}`);

    console.log("✅ Database check completed successfully");
  } catch (error) {
    console.error("❌ Database error:", error.message);

    if (error.message.includes("P1001")) {
      console.log("💡 Connection failed. Please check:");
      console.log("  - DATABASE_URL is correct");
      console.log("  - Database server is running");
      console.log("  - Network connectivity");
    } else if (error.message.includes("P1017")) {
      console.log(
        "💡 Server closed connection. This might be a temporary issue.",
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixDatabaseIssues().catch(console.error);
