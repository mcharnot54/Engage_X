import { NextRequest, NextResponse } from "next/server";
import {
  getDepartmentsByFacility,
  createDepartment,
} from "@/lib/db-operations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get("facilityId");

    if (!facilityId) {
      return NextResponse.json(
        { error: "Facility ID is required" },
        { status: 400 },
      );
    }

    const departments = await getDepartmentsByFacility(parseInt(facilityId));
    return NextResponse.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const department = await createDepartment(body);
    return NextResponse.json(department);
  } catch (error) {
    console.error("Error creating department:", error);
    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 },
    );
  }
}
