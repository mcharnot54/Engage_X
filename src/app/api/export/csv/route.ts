import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all standards with related data
    const standards = await prisma.standard.findMany({
      include: {
        facility: {
          include: {
            organization: true,
          },
        },
        department: true,
        area: true,
        uomEntries: true,
      },
    });

    // Generate CSV headers
    const headers = [
      "id",
      "organizationName",
      "organizationCode",
      "facilityName",
      "facilityRef",
      "facilityCity",
      "departmentName",
      "areaName",
      "standardName",
      "bestPractices",
      "processOpportunities",
      "uomEntries",
      "version",
      "isCurrentVersion",
      "versionNotes",
      "createdBy",
      "createdAt",
      "updatedAt",
    ];

    // Generate CSV rows
    const csvRows = standards.map((standard) => {
      return [
        standard.id,
        standard.facility.organization?.name || "",
        standard.facility.organization?.code || "",
        standard.facility.name,
        standard.facility.ref || "",
        standard.facility.city || "",
        standard.department.name,
        standard.area.name,
        standard.name,
        standard.bestPractices.join("; "),
        standard.processOpportunities.join("; "),
        JSON.stringify(standard.uomEntries),
        standard.version,
        standard.isCurrentVersion,
        standard.versionNotes || "",
        standard.createdBy || "",
        standard.createdAt.toISOString(),
        standard.updatedAt.toISOString(),
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="standards-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting standards:", error);
    return NextResponse.json(
      { error: "Failed to export standards" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { table } = await request.json();

    let data: any[] = [];
    let filename = "";
    let headers: string[] = [];

    switch (table) {
      case "organizations":
        data = await prisma.organization.findMany();
        filename = "organizations";
        headers = ["id", "name", "code", "logo", "createdAt", "updatedAt"];
        break;

      case "facilities":
        data = await prisma.facility.findMany({
          include: { organization: true },
        });
        filename = "facilities";
        headers = [
          "id",
          "name",
          "ref",
          "city",
          "organizationId",
          "organizationName",
          "createdAt",
          "updatedAt",
        ];
        break;

      case "departments":
        data = await prisma.department.findMany({
          include: { facility: { include: { organization: true } } },
        });
        filename = "departments";
        headers = [
          "id",
          "name",
          "facilityId",
          "facilityName",
          "organizationName",
          "createdAt",
          "updatedAt",
        ];
        break;

      case "areas":
        data = await prisma.area.findMany({
          include: {
            department: {
              include: {
                facility: {
                  include: { organization: true },
                },
              },
            },
          },
        });
        filename = "areas";
        headers = [
          "id",
          "name",
          "departmentId",
          "departmentName",
          "facilityName",
          "organizationName",
          "createdAt",
          "updatedAt",
        ];
        break;

      case "standards":
        data = await prisma.standard.findMany({
          include: {
            facility: { include: { organization: true } },
            department: true,
            area: true,
            uomEntries: true,
          },
        });
        filename = "standards";
        headers = [
          "id",
          "name",
          "facilityId",
          "facilityName",
          "departmentId",
          "departmentName",
          "areaId",
          "areaName",
          "organizationName",
          "organizationCode",
          "bestPractices",
          "processOpportunities",
          "uomEntries",
          "version",
          "isCurrentVersion",
          "versionNotes",
          "createdBy",
          "createdAt",
          "updatedAt",
        ];
        break;

      case "uomEntries":
        data = await prisma.uomEntry.findMany({
          include: {
            standard: {
              include: {
                facility: { include: { organization: true } },
                department: true,
                area: true,
              },
            },
          },
        });
        filename = "uom-entries";
        headers = [
          "id",
          "uom",
          "description",
          "samValue",
          "tags",
          "standardId",
          "standardName",
          "organizationName",
          "facilityName",
          "departmentName",
          "areaName",
          "createdAt",
          "updatedAt",
        ];
        break;

      case "users":
        data = await prisma.user.findMany({
          include: { userRole: true },
        });
        filename = "users";
        headers = [
          "id",
          "employeeId",
          "employeeNumber",
          "name",
          "email",
          "department",
          "role",
          "roleId",
          "roleName",
          "isActive",
          "lastSyncAt",
          "externalSource",
          "createdAt",
          "updatedAt",
        ];
        break;

      case "observations":
        data = await prisma.observation.findMany({
          include: {
            standard: {
              include: {
                facility: { include: { organization: true } },
                department: true,
                area: true,
              },
            },
            user: true,
            observationData: true,
          },
        });
        filename = "observations";
        headers = [
          "id",
          "observationReason",
          "standardId",
          "standardName",
          "timeObserved",
          "observationStartTime",
          "observationEndTime",
          "totalSams",
          "observedPerformance",
          "pace",
          "utilization",
          "methods",
          "pumpScore",
          "comments",
          "aiNotes",
          "supervisorSignature",
          "teamMemberSignature",
          "isFinalized",
          "bestPracticesChecked",
          "delays",
          "processAdherenceChecked",
          "userId",
          "userName",
          "observationData",
          "organizationName",
          "facilityName",
          "departmentName",
          "areaName",
          "createdAt",
          "updatedAt",
        ];
        break;

      default:
        return NextResponse.json(
          { error: "Invalid table specified" },
          { status: 400 },
        );
    }

    // Generate CSV rows based on table type
    const csvRows = data.map((item: any) => {
      switch (table) {
        case "organizations":
          return [
            item.id,
            item.name,
            item.code,
            item.logo || "",
            item.createdAt.toISOString(),
            item.updatedAt.toISOString(),
          ];

        case "facilities":
          return [
            item.id,
            item.name,
            item.ref || "",
            item.city || "",
            item.organizationId,
            item.organization?.name || "",
            item.createdAt.toISOString(),
            item.updatedAt.toISOString(),
          ];

        case "departments":
          return [
            item.id,
            item.name,
            item.facilityId,
            item.facility?.name || "",
            item.facility?.organization?.name || "",
            item.createdAt.toISOString(),
            item.updatedAt.toISOString(),
          ];

        case "areas":
          return [
            item.id,
            item.name,
            item.departmentId,
            item.department?.name || "",
            item.department?.facility?.name || "",
            item.department?.facility?.organization?.name || "",
            item.createdAt.toISOString(),
            item.updatedAt.toISOString(),
          ];

        case "standards":
          return [
            item.id,
            item.name,
            item.facilityId,
            item.facility?.name || "",
            item.departmentId,
            item.department?.name || "",
            item.areaId,
            item.area?.name || "",
            item.facility?.organization?.name || "",
            item.facility?.organization?.code || "",
            item.bestPractices.join("; "),
            item.processOpportunities.join("; "),
            JSON.stringify(item.uomEntries),
            item.version,
            item.isCurrentVersion,
            item.versionNotes || "",
            item.createdBy || "",
            item.createdAt.toISOString(),
            item.updatedAt.toISOString(),
          ];

        case "uomEntries":
          return [
            item.id,
            item.uom,
            item.description,
            item.samValue,
            item.tags.join("; "),
            item.standardId,
            item.standard?.name || "",
            item.standard?.facility?.organization?.name || "",
            item.standard?.facility?.name || "",
            item.standard?.department?.name || "",
            item.standard?.area?.name || "",
            item.createdAt.toISOString(),
            item.updatedAt.toISOString(),
          ];

        case "users":
          return [
            item.id,
            item.employeeId,
            item.employeeNumber || "",
            item.name,
            item.email || "",
            item.department || "",
            item.role || "",
            item.roleId || "",
            item.userRole?.name || "",
            item.isActive,
            item.lastSyncAt?.toISOString() || "",
            item.externalSource || "",
            item.createdAt.toISOString(),
            item.updatedAt.toISOString(),
          ];

        case "observations":
          return [
            item.id,
            item.observationReason,
            item.standardId,
            item.standard?.name || "",
            item.timeObserved,
            item.observationStartTime?.toISOString() || "",
            item.observationEndTime?.toISOString() || "",
            item.totalSams,
            item.observedPerformance,
            item.pace,
            item.utilization,
            item.methods,
            item.pumpScore,
            item.comments || "",
            item.aiNotes || "",
            item.supervisorSignature || "",
            item.teamMemberSignature || "",
            item.isFinalized,
            item.bestPracticesChecked.join("; "),
            JSON.stringify(item.delays),
            item.processAdherenceChecked.join("; "),
            item.userId,
            item.user?.name || "",
            JSON.stringify(item.observationData),
            item.standard?.facility?.organization?.name || "",
            item.standard?.facility?.name || "",
            item.standard?.department?.name || "",
            item.standard?.area?.name || "",
            item.createdAt.toISOString(),
            item.updatedAt.toISOString(),
          ];

        default:
          return [];
      }
    });

    // Escape CSV values properly
    const escapeCsvValue = (value: any): string => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Combine headers and rows with proper escaping
    const csvContent = [
      headers.join(","),
      ...csvRows.map((row) => row.map(escapeCsvValue).join(",")),
    ].join("\n");

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 },
    );
  }
}
