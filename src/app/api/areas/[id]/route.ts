import { NextRequest, NextResponse } from "next/server";
import { updateArea } from "@/lib/db-operations";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const area = await updateArea(id, body);
    return NextResponse.json(area);
  } catch (error) {
    console.error("Error updating area:", error);
    return NextResponse.json(
      { error: "Failed to update area" },
      { status: 500 },
    );
  }
}
