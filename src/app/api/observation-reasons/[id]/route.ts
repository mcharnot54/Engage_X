import { NextRequest, NextResponse } from "next/server";
import {
  updateObservationReason,
  deleteObservationReason,
} from "@/lib/db-operations";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      purpose,
      leaderActionGuidelines,
      externalApiUrl,
    } = body;
    const id = params.id;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Observation reason name is required" },
        { status: 400 },
      );
    }

    const observationReason = await updateObservationReason(id, {
      name: name.trim(),
      description: description?.trim() || null,
      purpose: purpose?.trim() || null,
      leaderActionGuidelines: leaderActionGuidelines?.trim() || null,
      externalApiUrl: externalApiUrl?.trim() || null,
    });

    return NextResponse.json(observationReason);
  } catch (error) {
    console.error("Error updating observation reason:", error);
    return NextResponse.json(
      { error: "Failed to update observation reason" },
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
    await deleteObservationReason(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting observation reason:", error);
    return NextResponse.json(
      { error: "Failed to delete observation reason" },
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

    const observationReason = await updateObservationReason(id, { isActive });
    return NextResponse.json(observationReason);
  } catch (error) {
    console.error("Error updating observation reason status:", error);
    return NextResponse.json(
      { error: "Failed to update observation reason status" },
      { status: 500 },
    );
  }
}
