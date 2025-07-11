import { NextRequest, NextResponse } from "next/server";
import { getUserRoles, createUserRole } from "@/lib/db-operations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const roleId = searchParams.get("roleId");
    const organizationId = searchParams.get("organizationId");

    const userRoles = await getUserRoles({
      userId: userId || undefined,
      roleId: roleId ? parseInt(roleId) : undefined,
      organizationId: organizationId ? parseInt(organizationId) : undefined,
    });

    return NextResponse.json(userRoles);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch user roles" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, roleId, organizationId } = body;

    if (!userId || !roleId) {
      return NextResponse.json(
        { error: "User ID and Role ID are required" },
        { status: 400 },
      );
    }

    const userRole = await createUserRole({
      userId,
      roleId,
      organizationId: organizationId || undefined,
    });

    return NextResponse.json(userRole, { status: 201 });
  } catch (error) {
    console.error("Error creating user role:", error);

    // Handle unique constraint error
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "This user already has this role assigned" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to assign role to user" },
      { status: 500 },
    );
  }
}
