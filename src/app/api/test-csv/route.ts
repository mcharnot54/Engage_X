import { NextResponse } from "next/server";
import {
  parseCsvContent,
  validateStandardRow,
  transformRowToStandardData,
  generateCsvTemplate,
} from "@/lib/csv-utils";

export async function GET() {
  try {
    // Generate and test CSV template
    const template = generateCsvTemplate();

    // Test parsing the template
    const rows = parseCsvContent(template);

    if (rows.length === 0) {
      throw new Error("No rows parsed from template");
    }

    // Test validation and transformation
    const validation = validateStandardRow(rows[0], 0);
    let transformedData = null;

    if (validation.isValid) {
      transformedData = transformRowToStandardData(rows[0]);
    }

    return NextResponse.json({
      success: true,
      message: "CSV parsing test successful",
      data: {
        templateLineCount: template.split("\n").length,
        parsedRowCount: rows.length,
        validation: validation,
        transformedData: transformedData,
        sampleRow: rows[0],
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("CSV test error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown CSV parsing error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const csvContent = await file.text();

    // Test parsing
    const rows = parseCsvContent(csvContent);
    const validationResults = rows.map((row, index) => ({
      row: index + 1,
      validation: validateStandardRow(row, index),
    }));

    const validRows = validationResults.filter((r) => r.validation.isValid);
    const invalidRows = validationResults.filter((r) => !r.validation.isValid);

    return NextResponse.json({
      success: true,
      message: "CSV test parsing completed",
      data: {
        totalRows: rows.length,
        validRows: validRows.length,
        invalidRows: invalidRows.length,
        validationResults: validationResults,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("CSV upload test error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to test CSV upload",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
