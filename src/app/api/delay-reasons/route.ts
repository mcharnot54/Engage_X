import { NextRequest, NextResponse } from "next/server";
import { getDelayReasons, createDelayReason } from "@/lib/db-operations";

export async function GET() {
  try {
    const delayReasons = await getDelayReasons();
    return NextResponse.json(delayReasons);
  } catch (error) {
    console.error("Error fetching delay reasons:", error);
    return NextResponse.json(
      { error: "Failed to fetch delay reasons" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Delay reason name is required" },
        { status: 400 },
      );
    }

    const delayReason = await createDelayReason({
      name: name.trim(),
      description: description?.trim() || undefined,
    });

    return NextResponse.json(delayReason);
  } catch (error) {
    console.error("Error creating delay reason:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "A delay reason with this name already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create delay reason" },
      { status: 500 },
    );
  }
}
