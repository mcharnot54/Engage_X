import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();

    // Test basic queries
    const counts = await Promise.all([
      prisma.organization.count(),
      prisma.facility.count(),
      prisma.department.count(),
      prisma.area.count(),
      prisma.standard.count(),
      prisma.user.count(),
    ]);

    // Test standards query with notes field
    const standardsWithNotes = await prisma.standard.findMany({
      select: {
        id: true,
        name: true,
        notes: true,
      },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        counts: {
          organizations: counts[0],
          facilities: counts[1],
          departments: counts[2],
          areas: counts[3],
          standards: counts[4],
          users: counts[5],
        },
        sampleStandards: standardsWithNotes,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Database test error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown database error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
