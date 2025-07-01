import { NextRequest, NextResponse } from "next/server";
import { getStandards, createStandard } from "@/lib/db-operations";

export async function GET() {
  try {
    const standards = await getStandards();
    return NextResponse.json(standards);
  } catch (error: any) {
    console.error("Error fetching standards:", error);

    // Check if it's a database connection error
    if (
      error.code === "P1001" ||
      error.message?.includes("Environment variable not found: DATABASE_URL")
    ) {
      return NextResponse.json(
        {
          error:
            "Database connection failed. Please configure DATABASE_URL in your environment variables.",
          details:
            "Check .env.local file and ensure DATABASE_URL points to a valid PostgreSQL database.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch standards",
        details: error.message || "Unknown database error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const standard = await createStandard(body);
    return NextResponse.json(standard);
  } catch (error) {
    console.error("Error creating standard:", error);
    return NextResponse.json(
      { error: "Failed to create standard" },
      { status: 500 },
    );
  }
}
