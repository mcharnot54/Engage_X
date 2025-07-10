const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedSampleData() {
  console.log("🌱 Starting sample data seeding...");

  try {
    // Create sample organization
    const organization = await prisma.organization.create({
      data: {
        name: "ACME Manufacturing",
        code: "ACME",
        logo: null,
      },
    });

    console.log("✅ Created organization:", organization.name);

    // Create sample facility
    const facility = await prisma.facility.create({
      data: {
        name: "Main Production Facility",
        ref: "MPF001",
        city: "Detroit",
        organizationId: organization.id,
      },
    });

    console.log("✅ Created facility:", facility.name);

    // Create sample department
    const department = await prisma.department.create({
      data: {
        name: "Assembly Line",
        facilityId: facility.id,
      },
    });

    console.log("✅ Created department:", department.name);

    // Create sample area
    const area = await prisma.area.create({
      data: {
        name: "Station A",
        departmentId: department.id,
      },
    });

    console.log("✅ Created area:", area.name);

    // Create sample standard with UOM entries
    const standard = await prisma.standard.create({
      data: {
        name: "Widget Assembly Standard",
        facilityId: facility.id,
        departmentId: department.id,
        areaId: area.id,
        notes:
          "Standard procedure for assembling basic widgets with quality checks",
        bestPractices: [
          "Always wear safety equipment",
          "Follow 5S methodology",
          "Check quality at each step",
        ],
        processOpportunities: [
          "Implement visual management",
          "Reduce setup time",
          "Improve workflow",
        ],
        uomEntries: {
          create: [
            {
              uom: "Units",
              description: "Completed widget units",
              samValue: 2.5,
              tags: ["Production", "Quality"],
            },
            {
              uom: "Inspections",
              description: "Quality inspection checks",
              samValue: 0.8,
              tags: ["Quality", "Safety"],
            },
            {
              uom: "Setups",
              description: "Machine setup operations",
              samValue: 15.0,
              tags: ["Setup", "Efficiency"],
            },
          ],
        },
      },
      include: {
        uomEntries: true,
      },
    });

    console.log("✅ Created standard:", standard.name);
    console.log("✅ Created UOM entries:", standard.uomEntries.length);

    // Create sample users
    const users = await Promise.all([
      prisma.user.create({
        data: {
          employeeId: "emp001",
          name: "John Smith",
          email: "john.smith@acme.com",
          department: "Assembly Line",
        },
      }),
      prisma.user.create({
        data: {
          employeeId: "emp002",
          name: "Sarah Johnson",
          email: "sarah.johnson@acme.com",
          department: "Assembly Line",
        },
      }),
      prisma.user.create({
        data: {
          employeeId: "emp003",
          name: "Michael Brown",
          email: "michael.brown@acme.com",
          department: "Assembly Line",
        },
      }),
    ]);

    console.log("✅ Created users:", users.map((u) => u.name).join(", "));

    console.log("🎉 Sample data seeding completed successfully!");
    console.log("📊 Summary:");
    console.log(`  - 1 Organization: ${organization.name}`);
    console.log(`  - 1 Facility: ${facility.name}`);
    console.log(`  - 1 Department: ${department.name}`);
    console.log(`  - 1 Area: ${area.name}`);
    console.log(`  - 1 Standard: ${standard.name}`);
    console.log(`  - ${standard.uomEntries.length} UOM entries`);
    console.log(`  - ${users.length} Users`);
  } catch (error) {
    console.error("❌ Error seeding sample data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedSampleData().catch(console.error);
}

module.exports = { seedSampleData };
