const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        "postgresql://neondb_owner:npg_RyJ8d5Kuwgxa@ep-cold-cherry-addmb4el-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    },
  },
});

async function test() {
  try {
    console.log("Testing database connection...");
    console.log(
      "Using DATABASE_URL:",
      process.env.DATABASE_URL ? "from env" : "hardcoded",
    );

    const result = await prisma.organization.findMany();
    console.log("✅ Database connection successful!");
    console.log("Organizations found:", result.length);

    if (result.length > 0) {
      console.log("First organization:", result[0].name);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

test();
