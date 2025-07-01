import { NextRequest, NextResponse } from "next/server";
import { updateStandard, getStandardById } from "@/lib/db-operations";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    const standard = await getStandardById(id);
    if (!standard) {
      return NextResponse.json(
        { error: "Standard not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(standard);
  } catch (error) {
    console.error("Error fetching standard:", error);
    return NextResponse.json(
      { error: "Failed to fetch standard" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const standard = await updateStandard(id, body);
    return NextResponse.json(standard);
  } catch (error) {
    console.error("Error updating standard:", error);
    return NextResponse.json(
      { error: "Failed to update standard" },
      { status: 500 },
    );
  }
}
