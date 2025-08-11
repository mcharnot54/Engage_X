import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supervisorId = searchParams.get("supervisorId");
    const period = searchParams.get("period") || "month"; // month, quarter, year, all

    if (!supervisorId) {
      return NextResponse.json(
        { error: "Supervisor ID is required" },
        { status: 400 },
      );
    }

    // Calculate period start date
    let periodStart: Date | undefined;
    const now = new Date();

    switch (period) {
      case "month":
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        periodStart = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case "year":
        periodStart = new Date(now.getFullYear(), 0, 1);
        break;
      case "all":
        periodStart = undefined; // No filter
        break;
    }

    // Get observations conducted BY the supervisor (matching supervisorSignature)
    const observations = await prisma.observation.findMany({
      where: {
        supervisorSignature: supervisorId, // Match exact supervisor name
        ...(periodStart && {
          createdAt: {
            gte: periodStart,
          },
        }),
      },
      select: {
        id: true,
        pumpScore: true,
        observedPerformance: true,
        createdAt: true,
        supervisorSignature: true,
        standardId: true,
        standard: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            employeeId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const supervisorObservations = observations;

    if (supervisorObservations.length === 0) {
      return NextResponse.json({
        averageGradeFactor: 0,
        averageObservedPerformance: 0,
        totalObservationsCompleted: 0,
        trend: "stable",
        period,
        periodStart: periodStart?.toISOString(),
        observations: [],
      });
    }

    // Calculate averages for observations conducted by this supervisor
    const totalGradeFactor = supervisorObservations.reduce(
      (sum, obs) => sum + obs.pumpScore,
      0,
    );
    const totalObservedPerf = supervisorObservations.reduce(
      (sum, obs) => sum + obs.observedPerformance,
      0,
    );

    const averageGradeFactor = totalGradeFactor / supervisorObservations.length;
    const averageObservedPerformance =
      totalObservedPerf / supervisorObservations.length;

    // Calculate trend (compare first half vs second half of observations)
    let trend: "up" | "down" | "stable" = "stable";

    if (supervisorObservations.length >= 4) {
      const midpoint = Math.floor(supervisorObservations.length / 2);
      const recentObservations = supervisorObservations.slice(0, midpoint);
      const olderObservations = supervisorObservations.slice(midpoint);

      const recentAvg =
        recentObservations.reduce(
          (sum, obs) => sum + obs.observedPerformance,
          0,
        ) / recentObservations.length;
      const olderAvg =
        olderObservations.reduce(
          (sum, obs) => sum + obs.observedPerformance,
          0,
        ) / olderObservations.length;

      const difference = recentAvg - olderAvg;
      if (difference > 2) {
        trend = "up";
      } else if (difference < -2) {
        trend = "down";
      }
    }

    return NextResponse.json({
      averageGradeFactor: Math.round(averageGradeFactor * 10) / 10,
      averageObservedPerformance:
        Math.round(averageObservedPerformance * 10) / 10,
      totalObservationsCompleted: supervisorObservations.length,
      trend,
      period,
      periodStart: periodStart?.toISOString(),
      observations: supervisorObservations.map((obs) => ({
        id: obs.id,
        pumpScore: obs.pumpScore,
        observedPerformance: obs.observedPerformance,
        createdAt: obs.createdAt,
        employeeName: obs.user?.name,
        employeeId: obs.user?.employeeId,
      })),
    });
  } catch (error) {
    console.error("Error fetching supervisor performance metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch supervisor performance metrics" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
