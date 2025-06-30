import { NextRequest, NextResponse } from "next/server";
import { getAreasByDepartment, createArea } from "@/lib/db-operations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");

    if (!departmentId) {
      return NextResponse.json(
        { error: "Department ID is required" },
        { status: 400 },
      );
    }

    const areas = await getAreasByDepartment(parseInt(departmentId));
    return NextResponse.json(areas);
  } catch (error) {
    console.error("Error fetching areas:", error);
    return NextResponse.json(
      { error: "Failed to fetch areas" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const area = await createArea(body);
    return NextResponse.json(area);
  } catch (error) {
    console.error("Error creating area:", error);
    return NextResponse.json(
      { error: "Failed to create area" },
      { status: 500 },
    );
  }
}
