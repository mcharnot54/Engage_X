import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const period = searchParams.get("period") || "month"; // day, week, month, quarter, year

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        observationGoalPerDay: true,
        observationGoalPerWeek: true,
        observationGoalPerMonth: true,
        observationGoalPerQuarter: true,
        observationGoalPerYear: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get goal based on period
    let goalTarget = 0;
    let periodStart = new Date();

    switch (period) {
      case "day":
        goalTarget = user.observationGoalPerDay || 0;
        periodStart.setHours(0, 0, 0, 0);
        break;
      case "week":
        goalTarget = user.observationGoalPerWeek || 0;
        const dayOfWeek = periodStart.getDay();
        periodStart.setDate(periodStart.getDate() - dayOfWeek);
        periodStart.setHours(0, 0, 0, 0);
        break;
      case "month":
        goalTarget = user.observationGoalPerMonth || 0;
        periodStart = new Date(
          periodStart.getFullYear(),
          periodStart.getMonth(),
          1,
        );
        break;
      case "quarter":
        goalTarget = user.observationGoalPerQuarter || 0;
        const quarter = Math.floor(periodStart.getMonth() / 3);
        periodStart = new Date(periodStart.getFullYear(), quarter * 3, 1);
        break;
      case "year":
        goalTarget = user.observationGoalPerYear || 0;
        periodStart = new Date(periodStart.getFullYear(), 0, 1);
        break;
    }

    // Count observations in the current period
    const observationsCompleted = await prisma.observation.count({
      where: {
        userId: userId,
        createdAt: {
          gte: periodStart,
        },
      },
    });

    const remaining = Math.max(0, goalTarget - observationsCompleted);
    const completionPercentage =
      goalTarget > 0
        ? Math.round((observationsCompleted / goalTarget) * 100)
        : 0;

    return NextResponse.json({
      totalObservations: observationsCompleted,
      goalObservations: goalTarget,
      remainingObservations: remaining,
      completionPercentage,
      period,
      periodStart: periodStart.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching goal metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch goal metrics" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      observationGoalPerDay,
      observationGoalPerWeek,
      observationGoalPerMonth,
      observationGoalPerQuarter,
      observationGoalPerYear,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        observationGoalPerDay: observationGoalPerDay || 0,
        observationGoalPerWeek: observationGoalPerWeek || 0,
        observationGoalPerMonth: observationGoalPerMonth || 0,
        observationGoalPerQuarter: observationGoalPerQuarter || 0,
        observationGoalPerYear: observationGoalPerYear || 0,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Goals updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating goals:", error);
    return NextResponse.json(
      { error: "Failed to update goals" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
