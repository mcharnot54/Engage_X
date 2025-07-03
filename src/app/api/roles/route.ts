import { NextRequest, NextResponse } from "next/server";
import { getRoles } from "@/lib/db-operations";

export async function GET(request: NextRequest) {
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
