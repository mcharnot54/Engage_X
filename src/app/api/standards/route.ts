import { NextRequest, NextResponse } from "next/server";
import { getStandards, createStandard } from "@/lib/db-operations";

export async function GET() {
  try {
    const standards = await getStandards();
    return NextResponse.json(standards);
  } catch (error) {
    console.error("Error fetching standards:", error);
    return NextResponse.json(
      { error: "Failed to fetch standards" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const standard = await createStandard(body);
    return NextResponse.json(standard);
  } catch (error) {
    console.error("Error creating standard:", error);
    return NextResponse.json(
      { error: "Failed to create standard" },
      { status: 500 },
    );
  }
}
