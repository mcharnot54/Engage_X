import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/db-operations";
import { getTenantContext } from "@/lib/tenant-context";

export async function GET(request: NextRequest) {
  try {
    // For now, we'll use a hardcoded user ID for demonstration
    // In a real app, this would come from the session/auth token
    // Switch between "user1" (regular user) and "cmcnmochd0001l204wtiz8k8t" (system admin)
    const { searchParams } = new URL(request.url);
    const testUser = searchParams.get("user") || "user1";
    const userId = testUser === "admin" ? "cmcnmochd0001l204wtiz8k8t" : "user1";

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tenantContext = getTenantContext(user);

    return NextResponse.json({
      tenantContext,
      user: {
        id: user.id,
        name: user.name,
        organizationid: user.organizationid,
        isSystemAdmin: tenantContext.isSystemAdmin,
      },
    });
  } catch (error) {
    console.error("Error getting tenant context:", error);
    return NextResponse.json(
      { error: "Failed to get tenant context" },
      { status: 500 },
    );
  }
}
