import { NextRequest, NextResponse } from "next/server";
import { updateDelayReason, deleteDelayReason } from "@/lib/db-operations";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const { name, description } = body;
    const id = params.id;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Delay reason name is required" },
        { status: 400 },
      );
    }

    const delayReason = await updateDelayReason(id, {
      name: name.trim(),
      description: description?.trim() || null,
    });

    return NextResponse.json(delayReason);
  } catch (error) {
    console.error("Error updating delay reason:", error);
    return NextResponse.json(
      { error: "Failed to update delay reason" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;
    await deleteDelayReason(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting delay reason:", error);
    return NextResponse.json(
      { error: "Failed to delete delay reason" },
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
    const id = params.id;

    const delayReason = await updateDelayReason(id, { isActive });
    return NextResponse.json(delayReason);
  } catch (error) {
    console.error("Error updating delay reason status:", error);
    return NextResponse.json(
      { error: "Failed to update delay reason status" },
      { status: 500 },
    );
  }
}
