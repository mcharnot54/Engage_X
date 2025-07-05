import { NextRequest, NextResponse } from "next/server";
import {
  updateStandard,
  getStandardById,
  createStandardVersion,
  getStandardVersionHistory,
} from "@/lib/db-operations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const body = await request.json();

    if (body.action === "create_version") {
      const newVersion = await createStandardVersion(id, body.data);
      return NextResponse.json(newVersion);
    } else if (body.action === "get_history") {
      const history = await getStandardVersionHistory(id);
      return NextResponse.json(history);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing standard request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
