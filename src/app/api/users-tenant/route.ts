import { NextRequest, NextResponse } from "next/server";
import { getUserById, getUsersWithTenantContext } from "@/lib/db-operations";
import { getTenantContext } from "@/lib/tenant-context";

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, using hardcoded user ID
    // In production, this would come from the authenticated session
    const { searchParams } = new URL(request.url);
    const testUser = searchParams.get("user") || "user1";
    const role = searchParams.get("role"); // Get role filter parameter
    const currentUserId =
      testUser === "admin" ? "cmcnmochd0001l204wtiz8k8t" : "user1";

    // Get the current user to determine tenant context
    const currentUser = await getUserById(currentUserId);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Current user not found" },
        { status: 401 },
      );
    }

    // Get tenant context
    const tenantContext = getTenantContext(currentUser);

    // Get users with proper tenant filtering
    let users = await getUsersWithTenantContext(tenantContext);

    // Filter by role if specified
    if (role) {
      users = users.filter((user) => {
        // Check direct role relationship
        if (user.role?.name === role) return true;
        // Check many-to-many UserRole relationships
        return (
          user.userRoles?.some((userRole) => userRole.role.name === role) ||
          false
        );
      });
    }

    return NextResponse.json({
      users,
      tenantContext: {
        isSystemAdmin: tenantContext.isSystemAdmin,
        organizationId: tenantContext.organizationId,
      },
    });
  } catch (error) {
    console.error("Error fetching tenant-aware users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
