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

async function insertDepartments() {
  const departmentsData = [
    {
      id: 1,
      name: "Picking",
      facilityId: 1,
    },
    {
      id: 2,
      name: "Packaging",
      facilityId: 1,
    },
  ];

  try {
    console.log("Inserting Departments...");

    for (const dept of departmentsData) {
      await prisma.department.upsert({
        where: { id: dept.id },
        update: dept,
        create: dept,
      });
      console.log(`✓ Inserted Department: ${dept.name}`);
    }

    console.log("✅ All Departments inserted successfully!");
  } catch (error) {
    console.error("❌ Error inserting Departments:", error);
  }
}

async function insertFacilities() {
  const facilitiesData = [
    {
      id: 1,
      name: "PDC",
      ref: "Barzen",
      city: "Thief River",
      organizationId: 3,
    },
  ];

  try {
    console.log("Inserting Facilities...");

    for (const facility of facilitiesData) {
      await prisma.facility.upsert({
        where: { id: facility.id },
        update: facility,
        create: facility,
      });
      console.log(`✓ Inserted Facility: ${facility.name} (${facility.city})`);
    }

    console.log("✅ All Facilities inserted successfully!");
  } catch (error) {
    console.error("❌ Error inserting Facilities:", error);
  }
}

async function insertAreas() {
  const areasData = [
    {
      id: 1,
      name: "Gray Shelf",
      departmentId: 1,
    },
  ];

  try {
    console.log("Inserting Areas...");

    for (const area of areasData) {
      await prisma.area.upsert({
        where: { id: area.id },
        update: area,
        create: area,
      });
      console.log(`✓ Inserted Area: ${area.name}`);
    }

    console.log("✅ All Areas inserted successfully!");
  } catch (error) {
    console.error("❌ Error inserting Areas:", error);
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

async function insertObservationsAndData() {
  // First create users if they don't exist
  const userData = [
    {
      id: "user1",
      employeeId: "EMP001",
      name: "Default User",
    },
  ];

  for (const user of userData) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }

  // Create observations
  const observationsData = [
    {
      id: "cmcldafyaC",
      observationReason: "Standard Assessment",
      standardId: 1,
      timeObserved: 8.0,
      totalSams: 3.889,
      observedPerformance: 100.0,
      pace: 100,
      utilization: 100,
      methods: 100,
      pumpScore: 100.0,
      isFinalized: false,
      bestPracticesChecked: [],
      delays: [],
      processAdherenceChecked: [],
      userId: "user1",
    },
    {
      id: "cmclf0im1C",
      observationReason: "Follow-up Assessment",
      standardId: 1,
      timeObserved: 8.0,
      totalSams: 1.599,
      observedPerformance: 100.0,
      pace: 100,
      utilization: 100,
      methods: 100,
      pumpScore: 100.0,
      isFinalized: false,
      bestPracticesChecked: [],
      delays: [],
      processAdherenceChecked: [],
      userId: "user1",
    },
  ];

  // Create observation data
  const observationDataEntries = [
    // First observation data set
    {
      id: "data1",
      observationId: "cmcldafyaC",
      uom: "TASKS STA",
      description: "Tasks/Cart:",
      quantity: 1,
      samValue: 1.026,
      totalSams: 1.026,
    },
    {
      id: "data2",
      observationId: "cmcldafyaC",
      uom: "BINS SET U",
      description: "Bins Set Ur",
      quantity: 1,
      samValue: 0.016,
      totalSams: 0.016,
    },
    {
      id: "data3",
      observationId: "cmcldafyaC",
      uom: "UNIQUE LO",
      description: "Locations f",
      quantity: 1,
      samValue: 0.257,
      totalSams: 0.257,
    },
    {
      id: "data4",
      observationId: "cmcldafyaC",
      uom: "FULL ILPNs",
      description: "Full ILPNs f",
      quantity: 1,
      samValue: 0.782,
      totalSams: 0.782,
    },
    {
      id: "data5",
      observationId: "cmcldafyaC",
      uom: "ILPNs SHO",
      description: "ILPNs Shor",
      quantity: 0,
      samValue: 2.577,
      totalSams: 0,
    },
    {
      id: "data6",
      observationId: "cmcldafyaC",
      uom: "TRAYS IND",
      description: "Picks on Tr",
      quantity: 0,
      samValue: 0.202,
      totalSams: 0,
    },
    {
      id: "data7",
      observationId: "cmcldafyaC",
      uom: "NONCON I",
      description: "Picks Drop",
      quantity: 0,
      samValue: 0.843,
      totalSams: 0,
    },
    {
      id: "data8",
      observationId: "cmcldafyaC",
      uom: "TASK GRO",
      description: "# of Times",
      quantity: 1,
      samValue: 1.808,
      totalSams: 1.808,
    },

    // Second observation data set
    {
      id: "data9",
      observationId: "cmclf0im1C",
      uom: "TASKS STA",
      description: "Tasks/Cart:",
      quantity: 1,
      samValue: 1.026,
      totalSams: 1.026,
    },
    {
      id: "data10",
      observationId: "cmclf0im1C",
      uom: "BINS SET U",
      description: "Bins Set Ur",
      quantity: 0,
      samValue: 0.016,
      totalSams: 0,
    },
    {
      id: "data11",
      observationId: "cmclf0im1C",
      uom: "UNIQUE LO",
      description: "Locations f",
      quantity: 1,
      samValue: 0.257,
      totalSams: 0.257,
    },
    {
      id: "data12",
      observationId: "cmclf0im1C",
      uom: "FULL ILPNs",
      description: "Full ILPNs f",
      quantity: 0,
      samValue: 0.782,
      totalSams: 0,
    },
    {
      id: "data13",
      observationId: "cmclf0im1C",
      uom: "ILPNs SHO",
      description: "ILPNs Shor",
      quantity: 0,
      samValue: 2.577,
      totalSams: 0,
    },
    {
      id: "data14",
      observationId: "cmclf0im1C",
      uom: "TRAYS IND",
      description: "Picks on Tr",
      quantity: 0,
      samValue: 0.202,
      totalSams: 0,
    },
    {
      id: "data15",
      observationId: "cmclf0im1C",
      uom: "NONCON I",
      description: "Picks Drop",
      quantity: 0,
      samValue: 0.843,
      totalSams: 0,
    },
    {
      id: "data16",
      observationId: "cmclf0im1C",
      uom: "TASK GRO",
      description: "# of Times",
      quantity: 0,
      samValue: 1.808,
      totalSams: 0,
    },
  ];

  try {
    console.log("Inserting Observations...");

    for (const obs of observationsData) {
      await prisma.observation.upsert({
        where: { id: obs.id },
        update: obs,
        create: obs,
      });
      console.log(`✓ Inserted Observation: ${obs.id}`);
    }

    console.log("Inserting Observation Data...");

    for (const data of observationDataEntries) {
      await prisma.observationData.upsert({
        where: { id: data.id },
        update: data,
        create: data,
      });
      console.log(
        `✓ Inserted Observation Data: ${data.uom} for ${data.observationId}`,
      );
    }

    console.log(
      "✅ All Observations and Observation Data inserted successfully!",
    );
  } catch (error) {
    console.error("❌ Error inserting Observations:", error);
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
    await insertFacilities();
    await insertDepartments();
    await insertAreas();
    await insertStandards();
    await insertUomEntries();
    await insertObservationsAndData();
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
