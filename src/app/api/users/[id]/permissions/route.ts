import { NextRequest, NextResponse } from "next/server";
import { getUserPermissions } from "../../../../../../lib/tenant-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = params.id;
    const permissions = await getUserPermissions(userId);

    return NextResponse.json(permissions);
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 },
    );
  }
}
