import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const permissions = await prisma.permission.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          module: "asc",
        },
        {
          action: "asc",
        },
      ],
    });
    return NextResponse.json(permissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, module, action } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Permission name is required" },
        { status: 400 },
      );
    }

    if (!module || !module.trim()) {
      return NextResponse.json(
        { error: "Module is required" },
        { status: 400 },
      );
    }

    if (!action || !action.trim()) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 },
      );
    }

    const permission = await prisma.permission.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        module: module.trim().toLowerCase(),
        action: action.trim().toLowerCase(),
      },
    });

    return NextResponse.json(permission);
  } catch (error) {
    console.error("Error creating permission:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "A permission with this name already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create permission" },
      { status: 500 },
    );
  }
}
