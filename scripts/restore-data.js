const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createRequiredDependencies() {
  // First, let's create the basic organizational structure needed
  console.log("Creating required organizational structure...");

  // Create organization
  const org = await prisma.organization.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Default Organization",
      code: "DEFAULT",
    },
  });
  console.log("✓ Organization created");

  // Create facility
  const facility = await prisma.facility.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Default Facility",
      organizationId: org.id,
    },
  });
  console.log("✓ Facility created");

  // Create department
  const department = await prisma.department.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Default Department",
      facilityId: facility.id,
    },
  });
  console.log("✓ Department created");

  // Create area
  const area = await prisma.area.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Default Area",
      departmentId: department.id,
    },
  });
  console.log("✓ Area created");

  // Create standard
  const standard = await prisma.standard.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Default Standard",
      facilityId: facility.id,
      departmentId: department.id,
      areaId: area.id,
      version: 1,
      isCurrentVersion: true,
      isActive: true,
    },
  });
  console.log("✓ Standard created");

  return { org, facility, department, area, standard };
}

async function insertOrganizations() {
  const organizationData = [
    {
      id: 3,
      name: "DigiKey",
      code: "DK",
    },
    {
      id: 4,
      name: "Continuum",
      code: "CT",
    },
  ];

  try {
    console.log("Inserting Organizations...");

    for (const org of organizationData) {
      await prisma.organization.upsert({
        where: { id: org.id },
        update: org,
        create: org,
      });
      console.log(`✓ Inserted Organization: ${org.name} (${org.code})`);
    }

    console.log("✅ All Organizations inserted successfully!");
  } catch (error) {
    console.error("❌ Error inserting Organizations:", error);
  }
}

async function insertStandards() {
  const standardsData = [
    {
      id: 1,
      name: "Gray Shelf",
      facilityId: 1,
      departmentId: 1,
      areaId: 1,
      bestPractices: ["Use Maxim"],
      isActive: true,
      processOpportunities: ["Leaving C"],
      version: 1,
      isCurrentVersion: true,
    },
  ];

  try {
    console.log("Inserting Standards...");

    for (const standard of standardsData) {
      await prisma.standard.upsert({
        where: { id: standard.id },
        update: standard,
        create: standard,
      });
      console.log(`✓ Inserted Standard: ${standard.name}`);
    }

    console.log("✅ All Standards inserted successfully!");
  } catch (error) {
    console.error("❌ Error inserting Standards:", error);
  }
}

async function insertUomEntries() {
  const uomData = [
    {
      id: 1,
      uom: "TASKS STA",
      description: "Tasks/Cart:",
      samValue: 1.026,
      standardId: 1,
      tags: [],
    },
    {
      id: 2,
      uom: "BINS SPE",
      description: "Bins Se Ur",
      samValue: 0.016,
      standardId: 1,
      tags: [],
    },
    {
      id: 3,
      uom: "UNIQUE LO",
      description: "Locations f",
      samValue: 0.257,
      standardId: 1,
      tags: [],
    },
    {
      id: 4,
      uom: "FULL ILPNs",
      description: "Full ILPNs f",
      samValue: 0.782,
      standardId: 1,
      tags: [],
    },
    {
      id: 5,
      uom: "ILPNs SHO",
      description: "ILPNs Shor",
      samValue: 2.577,
      standardId: 1,
      tags: [],
    },
    {
      id: 6,
      uom: "TRAYS IND",
      description: "Picks on Tr",
      samValue: 0.202,
      standardId: 1,
      tags: [],
    },
    {
      id: 7,
      uom: "NONCON I",
      description: "Picks Drop",
      samValue: 0.843,
      standardId: 1,
      tags: [],
    },
    {
      id: 8,
      uom: "TASK GRO",
      description: "# of Times",
      samValue: 1.808,
      standardId: 1,
      tags: [],
    },
  ];

  try {
    console.log("Inserting UOM entries...");

    for (const uom of uomData) {
      await prisma.uomEntry.upsert({
        where: { id: uom.id },
        update: uom,
        create: uom,
      });
      console.log(`✓ Inserted UOM: ${uom.uom}`);
    }

    console.log("✅ All UOM entries inserted successfully!");
  } catch (error) {
    console.error("❌ Error inserting UOM entries:", error);
  }
}

async function main() {
  try {
    await createRequiredDependencies();
    await insertOrganizations();
    await insertStandards();
    await insertUomEntries();
    console.log("🎉 Data restoration completed successfully!");
  } catch (error) {
    console.error("❌ Error during restoration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
