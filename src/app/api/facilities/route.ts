import { NextRequest, NextResponse } from "next/server";
import {
  getFacilities,
  getFacilitiesByOrganization,
  createFacility,
} from "@/lib/db-operations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    let facilities;
    if (organizationId) {
      facilities = await getFacilitiesByOrganization(Number(organizationId));
    } else {
      facilities = await getFacilities();
    }

    return NextResponse.json(facilities);
  } catch (error) {
    console.error("Error fetching facilities:", error);
    return NextResponse.json(
      { error: "Failed to fetch facilities" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const facility = await createFacility(body);
    return NextResponse.json(facility);
  } catch (error) {
    console.error("Error creating facility:", error);
    return NextResponse.json(
      { error: "Failed to create facility" },
      { status: 500 },
    );
  }
}
