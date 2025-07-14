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
    const standardId = searchParams.get("standardId");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (userId) {
      const observations = await getObservationsByUser(
        userId,
        limit,
        standardId ? parseInt(standardId) : undefined,
      );
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
    console.log(
      "Creating observation with data:",
      JSON.stringify(body, null, 2),
    );

    const observation = await createObservation(body);
    return NextResponse.json(observation);
  } catch (error) {
    console.error("Error creating observation:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to create observation";
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        errorMessage = "Invalid user or standard ID provided";
      } else if (error.message.includes("required")) {
        errorMessage = "Missing required fields";
      } else if (error.message.includes("type")) {
        errorMessage = "Invalid data type provided";
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
