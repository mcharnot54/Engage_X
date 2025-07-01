import { NextRequest, NextResponse } from "next/server";
import {
  parseCsvContent,
  validateStandardRow,
  transformRowToStandardData,
  ParsedStandardData,
  ValidationResult,
} from "@/lib/csv-utils";
import { prisma } from "@/lib/prisma";

interface UploadResult {
  success: boolean;
  created: number;
  errors: string[];
  warnings: string[];
  details: Array<{
    row: number;
    standardName: string;
    status: "created" | "error";
    message?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "File must be a CSV" },
        { status: 400 },
      );
    }

    const csvContent = await file.text();

    // Parse CSV content
    let rows;
    try {
      rows = parseCsvContent(csvContent);
    } catch (parseError) {
      return NextResponse.json(
        { error: `Failed to parse CSV: ${parseError}` },
        { status: 400 },
      );
    }

    // Validate all rows first
    const validationResults: Array<{
      row: number;
      validation: ValidationResult;
      data?: ParsedStandardData;
    }> = [];
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const validation = validateStandardRow(rows[i], i);
      validationResults.push({ row: i + 1, validation });

      allErrors.push(...validation.errors);
      allWarnings.push(...validation.warnings);

      if (validation.isValid) {
        validationResults[i].data = transformRowToStandardData(rows[i]);
      }
    }

    // If there are validation errors, return them without processing
    if (allErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          created: 0,
          errors: allErrors,
          warnings: allWarnings,
          details: [],
        } as UploadResult,
        { status: 400 },
      );
    }

    // Process each valid row
    const result: UploadResult = {
      success: true,
      created: 0,
      errors: [],
      warnings: allWarnings,
      details: [],
    };

    for (const { row, data } of validationResults) {
      if (!data) continue;

      try {
        await createStandardFromData(data);
        result.created++;
        result.details.push({
          row,
          standardName: data.standardName,
          status: "created",
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        result.errors.push(
          `Row ${row}: Failed to create standard - ${errorMessage}`,
        );
        result.details.push({
          row,
          standardName: data.standardName,
          status: "error",
          message: errorMessage,
        });
      }
    }

    result.success = result.errors.length === 0;

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing CSV upload:", error);
    return NextResponse.json(
      { error: "Failed to process CSV upload" },
      { status: 500 },
    );
  }
}

async function createStandardFromData(data: ParsedStandardData) {
  return await prisma.$transaction(async (tx) => {
    // Find or create organization
    let organization = await tx.organization.findUnique({
      where: { code: data.organizationCode },
    });

    if (!organization) {
      organization = await tx.organization.create({
        data: {
          name: data.organizationName,
          code: data.organizationCode,
        },
      });
    }

    // Find or create facility
    let facility = await tx.facility.findFirst({
      where: {
        name: data.facilityName,
        organizationId: organization.id,
      },
    });

    if (!facility) {
      facility = await tx.facility.create({
        data: {
          name: data.facilityName,
          ref: data.facilityRef,
          city: data.facilityCity,
          organizationId: organization.id,
        },
      });
    }

    // Find or create department
    let department = await tx.department.findFirst({
      where: {
        name: data.departmentName,
        facilityId: facility.id,
      },
    });

    if (!department) {
      department = await tx.department.create({
        data: {
          name: data.departmentName,
          facilityId: facility.id,
        },
      });
    }

    // Find or create area
    let area = await tx.area.findFirst({
      where: {
        name: data.areaName,
        departmentId: department.id,
      },
    });

    if (!area) {
      area = await tx.area.create({
        data: {
          name: data.areaName,
          departmentId: department.id,
        },
      });
    }

    // Check if standard already exists
    const existingStandard = await tx.standard.findFirst({
      where: {
        name: data.standardName,
        areaId: area.id,
      },
    });

    if (existingStandard) {
      throw new Error(
        `Standard '${data.standardName}' already exists in this area`,
      );
    }

    // Create standard with UOM entries
    const standard = await tx.standard.create({
      data: {
        name: data.standardName,
        facilityId: facility.id,
        departmentId: department.id,
        areaId: area.id,
        bestPractices: data.bestPractices,
        processOpportunities: data.processOpportunities,
        uomEntries: {
          create: data.uomEntries,
        },
      },
      include: {
        uomEntries: true,
      },
    });

    return standard;
  });
}
