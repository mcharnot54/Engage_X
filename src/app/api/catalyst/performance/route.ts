import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const period = searchParams.get("period") || "month"; // month, quarter, year, all

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
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

    // Get observations for the period
    const observations = await prisma.observation.findMany({
      where: {
        userId: userId,
        ...(periodStart && {
          createdAt: {
            gte: periodStart,
          },
        }),
      },
      select: {
        pumpScore: true,
        observedPerformance: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (observations.length === 0) {
      return NextResponse.json({
        averageGradeFactor: 0,
        averageObservedPerformance: 0,
        totalObservationsCompleted: 0,
        trend: "stable",
        period,
        periodStart: periodStart?.toISOString(),
      });
    }

    // Calculate averages
    const totalGradeFactor = observations.reduce(
      (sum, obs) => sum + obs.pumpScore,
      0,
    );
    const totalObservedPerf = observations.reduce(
      (sum, obs) => sum + obs.observedPerformance,
      0,
    );

    const averageGradeFactor = totalGradeFactor / observations.length;
    const averageObservedPerformance = totalObservedPerf / observations.length;

    // Calculate trend (compare first half vs second half of observations)
    let trend: "up" | "down" | "stable" = "stable";

    if (observations.length >= 4) {
      const midpoint = Math.floor(observations.length / 2);
      const recentObservations = observations.slice(0, midpoint);
      const olderObservations = observations.slice(midpoint);

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
      totalObservationsCompleted: observations.length,
      trend,
      period,
      periodStart: periodStart?.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance metrics" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
