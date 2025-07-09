import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch all the data needed for the dashboard
    const [
      observations,
      organizations,
      facilities,
      departments,
      areas,
      standards,
      users,
      uomEntries,
      observationData,
    ] = await Promise.all([
      prisma.observation.findMany({
        include: {
          standard: true,
          user: true,
          observationData: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.organization.findMany({
        include: {
          facilities: {
            include: {
              departments: {
                include: {
                  areas: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.facility.findMany({
        include: {
          organization: true,
          departments: {
            include: {
              areas: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.department.findMany({
        include: {
          facility: {
            include: {
              organization: true,
            },
          },
          areas: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.area.findMany({
        include: {
          department: {
            include: {
              facility: {
                include: {
                  organization: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.standard.findMany({
        include: {
          facility: true,
          department: true,
          area: true,
          observations: true,
          uomEntries: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        include: {
          observations: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.uomEntry.findMany({
        include: {
          standard: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.observationData.findMany({
        include: {
          observation: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Calculate statistics
    const totalObservations = observations.length;
    const totalOrganizations = organizations.length;
    const totalFacilities = facilities.length;
    const totalDepartments = departments.length;
    const totalAreas = areas.length;
    const totalStandards = standards.length;
    const totalUsers = users.length;

    const completedObservations = observations.filter(
      (obs) => obs.isFinalized,
    ).length;
    const pendingObservations = totalObservations - completedObservations;

    // Calculate average performance
    const performanceSum = observations.reduce(
      (sum, obs) => sum + obs.observedPerformance,
      0,
    );
    const averagePerformance =
      totalObservations > 0 ? performanceSum / totalObservations : 0;

    // Calculate average scores
    const paceSum = observations.reduce((sum, obs) => sum + obs.pace, 0);
    const utilizationSum = observations.reduce(
      (sum, obs) => sum + obs.utilization,
      0,
    );
    const methodsSum = observations.reduce((sum, obs) => sum + obs.methods, 0);

    const averagePace = totalObservations > 0 ? paceSum / totalObservations : 0;
    const averageUtilization =
      totalObservations > 0 ? utilizationSum / totalObservations : 0;
    const averageMethods =
      totalObservations > 0 ? methodsSum / totalObservations : 0;

    // Performance trend data (for charts)
    const performanceData = observations.map((obs) => ({
      date: obs.createdAt,
      performance: obs.observedPerformance,
      pace: obs.pace,
      utilization: obs.utilization,
      methods: obs.methods,
      pumpScore: obs.pumpScore,
    }));

    // Recent observations (limited to 10 most recent)
    const recentObservations = observations.slice(0, 10);

    const dashboardData = {
      stats: {
        totalObservations,
        totalOrganizations,
        totalFacilities,
        totalDepartments,
        totalAreas,
        totalStandards,
        totalUsers,
        completedObservations,
        pendingObservations,
        averagePerformance,
        averagePace,
        averageUtilization,
        averageMethods,
      },
      recentObservations,
      organizations,
      facilities,
      departments,
      areas,
      standards,
      users,
      uomEntries,
      observationData,
      performanceData,
      summary: {
        organizationsWithFacilities: organizations.filter(
          (org) => org.facilities.length > 0,
        ).length,
        facilitiesWithDepartments: facilities.filter(
          (facility) => facility.departments.length > 0,
        ).length,
        departmentsWithAreas: departments.filter(
          (dept) => dept.areas.length > 0,
        ).length,
        standardsWithObservations: standards.filter(
          (standard) => standard.observations.length > 0,
        ).length,
        activeStandards: standards.filter((standard) => standard.isActive)
          .length,
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    switch (action) {
      case "refresh":
        // Trigger a data refresh
        return NextResponse.json({ message: "Data refreshed successfully" });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Dashboard POST error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
