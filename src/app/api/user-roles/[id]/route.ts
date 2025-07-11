import { NextRequest, NextResponse } from "next/server";
import { deleteUserRole } from "@/lib/db-operations";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "Valid User Role ID is required" },
        { status: 400 },
      );
    }

    await deleteUserRole(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user role:", error);
    return NextResponse.json(
      { error: "Failed to remove user role assignment" },
      { status: 500 },
    );
  }
}
