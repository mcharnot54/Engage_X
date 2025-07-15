import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const createdBy = searchParams.get("createdBy");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const scheduledObservations = await prisma.scheduledObservation.findMany({
      where: {
        ...(userId && { userId }),
        ...(createdBy && { createdBy }),
        ...(startDate &&
          endDate && {
            scheduledDate: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            department: true,
          },
        },
        standard: {
          select: {
            id: true,
            name: true,
            facility: {
              select: {
                name: true,
              },
            },
            department: {
              select: {
                name: true,
              },
            },
            area: {
              select: {
                name: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            employeeId: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "asc",
      },
    });

    return NextResponse.json({
      scheduledObservations,
    });
  } catch (error) {
    console.error("Error fetching scheduled observations:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheduled observations" },
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
      standardId,
      scheduledDate,
      scheduledTime,
      notes,
      createdBy,
    } = body;

    if (
      !userId ||
      !standardId ||
      !scheduledDate ||
      !scheduledTime ||
      !createdBy
    ) {
      return NextResponse.json(
        {
          error:
            "userId, standardId, scheduledDate, scheduledTime, and createdBy are required",
        },
        { status: 400 },
      );
    }

    // Verify the user and standard exist
    const [user, standard] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.standard.findUnique({ where: { id: parseInt(standardId) } }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!standard) {
      return NextResponse.json(
        { error: "Standard not found" },
        { status: 404 },
      );
    }

    const scheduledObservation = await prisma.scheduledObservation.create({
      data: {
        userId,
        standardId: parseInt(standardId),
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        notes: notes || null,
        createdBy,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            department: true,
          },
        },
        standard: {
          select: {
            id: true,
            name: true,
            facility: {
              select: {
                name: true,
              },
            },
            department: {
              select: {
                name: true,
              },
            },
            area: {
              select: {
                name: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            employeeId: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Observation scheduled successfully",
      scheduledObservation,
    });
  } catch (error) {
    console.error("Error creating scheduled observation:", error);
    return NextResponse.json(
      { error: "Failed to schedule observation" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Scheduled observation ID is required" },
        { status: 400 },
      );
    }

    const updatedObservation = await prisma.scheduledObservation.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.scheduledDate && {
          scheduledDate: new Date(updateData.scheduledDate),
        }),
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            department: true,
          },
        },
        standard: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            employeeId: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Scheduled observation updated successfully",
      scheduledObservation: updatedObservation,
    });
  } catch (error) {
    console.error("Error updating scheduled observation:", error);
    return NextResponse.json(
      { error: "Failed to update scheduled observation" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Scheduled observation ID is required" },
        { status: 400 },
      );
    }

    await prisma.scheduledObservation.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Scheduled observation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting scheduled observation:", error);
    return NextResponse.json(
      { error: "Failed to delete scheduled observation" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
