import { NextResponse } from "next/server";
import { generateCsvTemplate } from "@/lib/csv-utils";

export async function GET() {
  try {
    const csvContent = generateCsvTemplate();

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="standards-template.csv"',
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error generating CSV template:", error);
    return NextResponse.json(
      { error: "Failed to generate CSV template" },
      { status: 500 },
    );
  }
}
