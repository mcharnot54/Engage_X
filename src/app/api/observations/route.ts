import { NextRequest, NextResponse } from "next/server";
import { createObservation, getRecentObservations } from "@/lib/db-operations";

export async function GET() {
  try {
    const observations = await getRecentObservations(50);
    return NextResponse.json(observations);
  } catch (error) {
    console.error("Error fetching observations:", error);
    return NextResponse.json(
      { error: "Failed to fetch observations" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const observation = await createObservation(body);
    return NextResponse.json(observation);
  } catch (error) {
    console.error("Error creating observation:", error);
    return NextResponse.json(
      { error: "Failed to create observation" },
      { status: 500 },
    );
  }
}
