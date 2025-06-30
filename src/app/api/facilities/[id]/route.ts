import { NextRequest, NextResponse } from "next/server";
import { updateFacility } from "@/lib/db-operations";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const facility = await updateFacility(id, body);
    return NextResponse.json(facility);
  } catch (error) {
    console.error("Error updating facility:", error);
    return NextResponse.json(
      { error: "Failed to update facility" },
      { status: 500 },
    );
  }
}
