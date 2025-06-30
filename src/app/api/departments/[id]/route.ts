import { NextRequest, NextResponse } from "next/server";
import { updateDepartment } from "@/lib/db-operations";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const department = await updateDepartment(id, body);
    return NextResponse.json(department);
  } catch (error) {
    console.error("Error updating department:", error);
    return NextResponse.json(
      { error: "Failed to update department" },
      { status: 500 },
    );
  }
}
