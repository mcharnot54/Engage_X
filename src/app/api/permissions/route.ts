import { NextRequest, NextResponse } from "next/server";
import { getPermissions } from "@/lib/db-operations";

export async function GET(request: NextRequest) {
  try {
    const permissions = await getPermissions();
    return NextResponse.json(permissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 },
    );
  }
}
