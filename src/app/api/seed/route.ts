import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    console.log("Starting to populate sample data...");

    // Create Organizations
    const org1 = await prisma.organization.create({
      data: {
        name: "ACME Manufacturing",
        code: "ACME",
        logo: null,
      },
    });

    const org2 = await prisma.organization.create({
      data: {
        name: "TechCorp Industries",
        code: "TECH",
        logo: null,
      },
    });

    // Create Facilities
    const facility1 = await prisma.facility.create({
      data: {
        name: "Main Production Plant",
        ref: "MPP-001",
        city: "Detroit",
        organizationId: org1.id,
      },
    });

    const facility2 = await prisma.facility.create({
      data: {
        name: "East Coast Facility",
        ref: "ECF-002",
        city: "Atlanta",
        organizationId: org1.id,
      },
    });

    const facility3 = await prisma.facility.create({
      data: {
        name: "Tech Center",
        ref: "TC-001",
        city: "San Francisco",
        organizationId: org2.id,
      },
    });

    // Create Departments
    const dept1 = await prisma.department.create({
      data: {
        name: "Assembly Line A",
        facilityId: facility1.id,
      },
    });

    const dept2 = await prisma.department.create({
      data: {
        name: "Quality Control",
        facilityId: facility1.id,
      },
    });

    const dept3 = await prisma.department.create({
      data: {
        name: "Packaging",
        facilityId: facility2.id,
      },
    });

    const dept4 = await prisma.department.create({
      data: {
        name: "Research & Development",
        facilityId: facility3.id,
      },
    });

    // Create Areas
    const area1 = await prisma.area.create({
      data: {
        name: "Station 1 - Parts Assembly",
        departmentId: dept1.id,
      },
    });

    const area2 = await prisma.area.create({
      data: {
        name: "Station 2 - Component Testing",
        departmentId: dept1.id,
      },
    });

    const area3 = await prisma.area.create({
      data: {
        name: "Inspection Area",
        departmentId: dept2.id,
      },
    });

    const area4 = await prisma.area.create({
      data: {
        name: "Final Packaging Line",
        departmentId: dept3.id,
      },
    });

    const area5 = await prisma.area.create({
      data: {
        name: "Prototype Lab",
        departmentId: dept4.id,
      },
    });

    // Create Users
    const user1 = await prisma.user.create({
      data: {
        employeeId: "EMP001",
        name: "John Smith",
        email: "john.smith@acme.com",
        department: "Operations",
        role: "Production Manager",
      },
    });

    const user2 = await prisma.user.create({
      data: {
        employeeId: "EMP002",
        name: "Sarah Johnson",
        email: "sarah.johnson@acme.com",
        department: "Quality",
        role: "QC Supervisor",
      },
    });

    // Create Standards with UOM Entries
    const standard1 = await prisma.standard.create({
      data: {
        name: "Widget Assembly Standard v1.0",
        facilityId: facility1.id,
        departmentId: dept1.id,
        areaId: area1.id,
        bestPractices: [
          "Always wear safety glasses during assembly",
          "Check torque specifications before tightening",
          "Verify part numbers match work order",
          "Clean work surface between assemblies",
        ],
        processOpportunities: [
          "Implement 5S methodology at workstation",
          "Use color-coded bins for different parts",
          "Add visual inspection checklist",
          "Install ergonomic work surface",
        ],
        version: 1,
        isCurrentVersion: true,
        createdBy: "john.smith@acme.com",
        uomEntries: {
          create: [
            {
              uom: "UNITS",
              description: "Complete widget assembly",
              samValue: 2.5,
              tags: ["Assembly", "Primary"],
            },
            {
              uom: "INSPECT",
              description: "Quality inspection check",
              samValue: 0.75,
              tags: ["Quality", "Secondary"],
            },
            {
              uom: "PACK",
              description: "Package completed unit",
              samValue: 0.25,
              tags: ["Packaging", "Final"],
            },
          ],
        },
      },
    });

    const standard2 = await prisma.standard.create({
      data: {
        name: "Component Testing Protocol",
        facilityId: facility1.id,
        departmentId: dept1.id,
        areaId: area2.id,
        bestPractices: [
          "Calibrate testing equipment daily",
          "Record all test results in system",
          "Follow testing sequence exactly",
          "Report any anomalies immediately",
        ],
        processOpportunities: [
          "Automate data recording",
          "Implement statistical process control",
          "Add pre-test equipment check",
          "Create testing dashboard",
        ],
        version: 1,
        isCurrentVersion: true,
        createdBy: "sarah.johnson@acme.com",
        uomEntries: {
          create: [
            {
              uom: "TEST",
              description: "Single component test cycle",
              samValue: 1.2,
              tags: ["Testing", "Primary"],
            },
            {
              uom: "SETUP",
              description: "Test equipment setup",
              samValue: 0.5,
              tags: ["Setup", "Secondary"],
            },
            {
              uom: "RECORD",
              description: "Record test results",
              samValue: 0.3,
              tags: ["Documentation", "Secondary"],
            },
          ],
        },
      },
    });

    const standard3 = await prisma.standard.create({
      data: {
        name: "Quality Inspection Checklist",
        facilityId: facility1.id,
        departmentId: dept2.id,
        areaId: area3.id,
        bestPractices: [
          "Use proper lighting for visual inspection",
          "Check all measurement tools are calibrated",
          "Follow inspection sequence systematically",
          "Document any defects found",
        ],
        processOpportunities: [
          "Implement digital inspection forms",
          "Add photo documentation for defects",
          "Create real-time quality dashboard",
          "Establish trend analysis reporting",
        ],
        version: 1,
        isCurrentVersion: true,
        createdBy: "sarah.johnson@acme.com",
        uomEntries: {
          create: [
            {
              uom: "INSPECT",
              description: "Full product inspection",
              samValue: 3.0,
              tags: ["Inspection", "Primary"],
            },
            {
              uom: "MEASURE",
              description: "Dimensional measurements",
              samValue: 1.5,
              tags: ["Measurement", "Critical"],
            },
            {
              uom: "DOCUMENT",
              description: "Complete inspection record",
              samValue: 0.5,
              tags: ["Documentation", "Required"],
            },
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Sample data populated successfully!",
      data: {
        organizations: 2,
        facilities: 3,
        departments: 4,
        areas: 5,
        users: 2,
        standards: 3,
      },
    });
  } catch (error) {
    console.error("Error populating sample data:", error);
    return NextResponse.json(
      { error: "Failed to populate sample data", details: error },
      { status: 500 },
    );
  }
}
