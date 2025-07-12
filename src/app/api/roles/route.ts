import { NextRequest, NextResponse } from "next/server";
import { getRoles, createRole } from "@/lib/db-operations";

export async function GET() {
  try {
    const roles = await getRoles();
    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, permissionIds } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Role name is required" },
        { status: 400 },
      );
    }

    const role = await createRole({
      name: name.trim(),
      description: description?.trim() || undefined,
      permissionIds: permissionIds || [],
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error("Error creating role:", error);

    // Handle unique constraint error
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "A role with this name already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 },
    );
  }
}
