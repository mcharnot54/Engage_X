import { NextRequest, NextResponse } from "next/server";
import {
  getDepartmentsByFacility,
  createDepartment,
} from "@/lib/db-operations";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get("facilityId");

    if (facilityId) {
      const departments = await getDepartmentsByFacility(parseInt(facilityId));
      return NextResponse.json(departments);
    } else {
      // Get all departments
      const departments = await prisma.department.findMany({
        include: {
          facility: {
            include: {
              organization: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });
      return NextResponse.json(departments);
    }
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
