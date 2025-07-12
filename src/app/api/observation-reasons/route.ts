import { NextRequest, NextResponse } from "next/server";
import {
  getObservationReasons,
  createObservationReason,
} from "@/lib/db-operations";

export async function GET() {
  try {
    const observationReasons = await getObservationReasons();
    return NextResponse.json(observationReasons);
  } catch (error) {
    console.error("Error fetching observation reasons:", error);
    return NextResponse.json(
      { error: "Failed to fetch observation reasons" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, externalApiUrl } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Observation reason name is required" },
        { status: 400 },
      );
    }

    const observationReason = await createObservationReason({
      name: name.trim(),
      description: description?.trim() || undefined,
      externalApiUrl: externalApiUrl?.trim() || undefined,
    });

    return NextResponse.json(observationReason);
  } catch (error) {
    console.error("Error creating observation reason:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "An observation reason with this name already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create observation reason" },
      { status: 500 },
    );
  }
}
