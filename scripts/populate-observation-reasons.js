const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function populateObservationReasons() {
  try {
    console.log("🔄 Populating observation reasons...");

    // Define the four observation reasons from the form
    const observationReasons = [
      {
        name: "Performance Review",
        description:
          "Systematic evaluation of employee performance and productivity",
      },
      {
        name: "Training Assessment",
        description:
          "Evaluation during training sessions and skill development",
      },
      {
        name: "Incident Follow-up",
        description:
          "Observation following safety incidents or procedural violations",
      },
      {
        name: "Routine Check",
        description: "Regular scheduled observations for ongoing monitoring",
      },
    ];

    // Create observation reasons using upsert to avoid duplicates
    for (const reason of observationReasons) {
      const result = await prisma.observationReason.upsert({
        where: { name: reason.name },
        update: {
          description: reason.description,
          isActive: true,
        },
        create: {
          name: reason.name,
          description: reason.description,
          isActive: true,
        },
      });

      console.log(`✅ Created/Updated: ${result.name}`);
    }

    console.log("🎉 Successfully populated observation reasons!");
  } catch (error) {
    console.error("❌ Error populating observation reasons:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

populateObservationReasons();
