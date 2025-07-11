const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function addDelayReasons() {
  const defaultDelayReasons = [
    {
      name: "Waiting for Work",
      description: "Waiting for work or tasks to be assigned",
    },
    {
      name: "Equipment Breakdown",
      description: "Machine or equipment malfunction",
    },
    {
      name: "Material Shortage",
      description: "Insufficient raw materials or supplies",
    },
    {
      name: "Personnel Unavailable",
      description: "Staff member not available",
    },
    {
      name: "Quality Issue",
      description: "Product quality concerns requiring rework",
    },
    { name: "Safety Concern", description: "Safety-related stoppage" },
    {
      name: "Setup Time",
      description: "Time required for setup or changeover",
    },
    {
      name: "Maintenance",
      description: "Scheduled or unscheduled maintenance",
    },
    { name: "Other", description: "Other unspecified delay reason" },
  ];

  try {
    console.log("Adding delay reasons...");
    for (const reason of defaultDelayReasons) {
      const result = await prisma.delayReason.upsert({
        where: { name: reason.name },
        update: {},
        create: reason,
      });
      console.log(`✅ Added/Updated: ${result.name}`);
    }
    console.log("✅ Default delay reasons added successfully");
  } catch (error) {
    console.error("❌ Error adding delay reasons:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addDelayReasons();
