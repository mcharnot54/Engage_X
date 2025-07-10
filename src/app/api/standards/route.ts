import { NextRequest, NextResponse } from "next/server";
import { getStandards, createStandard } from "@/lib/db-operations-tenant";
import { getCurrentUserTenantContext } from "@/lib/auth-utils";

export async function GET() {
  try {
    // For development: bypass authentication and use direct database access
    const { getStandards: getStandardsDirect } = await import(
      "@/lib/db-operations"
    );
    const standards = await getStandardsDirect();

    return NextResponse.json({
      data: standards,
      meta: {
        organizationId: null,
        isSystemSuperuser: false,
        count: standards.length,
      },
    });
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

    // Check for tenant access errors
    if (error.message?.includes("Access denied")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
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
    // Get tenant context for current user
    const tenantContext = await getCurrentUserTenantContext();

    if (!tenantContext) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Create standard with tenant validation
    const standard = await createStandard(body, tenantContext);

    return NextResponse.json({
      data: standard,
      message: "Standard created successfully",
    });
  } catch (error: any) {
    console.error("Error creating standard:", error);

    // Check for tenant access errors
    if (error.message?.includes("Access denied")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to create standard",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
