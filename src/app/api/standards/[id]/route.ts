import { NextRequest, NextResponse } from "next/server";
import { updateStandard } from "@/lib/db-operations";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const standard = await updateStandard(id, body);
    return NextResponse.json(standard);
  } catch (error) {
    console.error("Error updating standard:", error);
    return NextResponse.json(
      { error: "Failed to update standard" },
      { status: 500 },
    );
  }
}
