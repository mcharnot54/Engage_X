import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const { name, description, isActive } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Observation reason name is required" },
        { status: 400 },
      );
    }

    const observationReason = await prisma.observationReason.update({
      where: {
        id: params.id,
      },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(observationReason);
  } catch (error) {
    console.error("Error updating observation reason:", error);
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        { error: "Observation reason not found" },
        { status: 404 },
      );
    }
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "An observation reason with this name already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update observation reason" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const { isActive } = body;

    const observationReason = await prisma.observationReason.update({
      where: {
        id: params.id,
      },
      data: {
        isActive: isActive,
      },
    });

    return NextResponse.json(observationReason);
  } catch (error) {
    console.error("Error updating observation reason status:", error);
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        { error: "Observation reason not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update observation reason status" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.observationReason.update({
      where: {
        id: params.id,
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deactivating observation reason:", error);
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        { error: "Observation reason not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Failed to deactivate observation reason" },
      { status: 500 },
    );
  }
}
