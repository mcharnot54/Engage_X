import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDelayReasons() {
  const defaultDelayReasons = [
    {
      name: "Equipment Failure",
      description: "Mechanical or electrical equipment malfunction",
    },
    {
      name: "Material Shortage",
      description: "Insufficient materials or supplies",
    },
    {
      name: "Training Required",
      description: "Additional training or instruction needed",
    },
    {
      name: "Safety Issue",
      description: "Safety concern requiring attention",
    },
    {
      name: "Process Interruption",
      description: "Interruption in normal process flow",
    },
    {
      name: "Quality Issue",
      description: "Quality control or assurance issue",
    },
    {
      name: "Environmental Factor",
      description: "Weather or environmental conditions",
    },
    {
      name: "Communication Delay",
      description: "Communication or coordination issues",
    },
  ];

  for (const reason of defaultDelayReasons) {
    try {
      await prisma.delayReason.upsert({
        where: { name: reason.name },
        update: {},
        create: reason,
      });
      console.log(`✓ Created/updated delay reason: ${reason.name}`);
    } catch (error) {
      console.error(`✗ Error creating delay reason ${reason.name}:`, error);
    }
  }
}

seedDelayReasons()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
