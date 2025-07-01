import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        facilities: true,
      },
    });

    return NextResponse.json(organizations);
  } catch (error: any) {
    console.error("Error fetching organizations:", error);

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
        error: "Failed to fetch organizations",
        details: error.message || "Unknown database error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, logo } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 },
      );
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        code,
        logo: logo || null,
      },
    });

    return NextResponse.json(organization);
  } catch (error: any) {
    console.error("Error creating organization:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "Organization code already exists. Please use a different code.",
        },
        { status: 409 },
      );
    }

    // Handle other Prisma errors
    if (error.code?.startsWith("P")) {
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 },
    );
  }
}
