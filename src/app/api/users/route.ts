import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmployeeId } from "@/lib/db-operations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    if (employeeId) {
      const user = await getUserByEmployeeId(employeeId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json(user);
    } else {
      // Get all users
      const { getUsers } = await import("@/lib/db-operations");
      const users = await getUsers();
      return NextResponse.json(users);
    }
  } catch (error) {
    console.error("Error fetching user(s):", error);
    return NextResponse.json(
      { error: "Failed to fetch user(s)" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await createUser(body);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
