import { NextRequest, NextResponse } from "next/server";
import {
  createObservation,
  getRecentObservations,
  getObservationsByUser,
} from "@/lib/db-operations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (userId) {
      const observations = await getObservationsByUser(userId, limit);
      return NextResponse.json(observations);
    } else {
      const observations = await getRecentObservations(limit);
      return NextResponse.json(observations);
    }
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
