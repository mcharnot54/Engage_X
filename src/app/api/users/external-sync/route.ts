import { NextRequest, NextResponse } from "next/server";
import { createADService } from "@/lib/external-apis/active-directory";
import { createSailPointService } from "@/lib/external-apis/sailpoint";
import { syncUserFromExternal } from "@/lib/db-operations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, filters } = body;

    let syncedUsers: any[] = [];
    let errors: string[] = [];

    if (source === "active_directory" || source === "all") {
      try {
        const adService = createADService();
        if (adService) {
          const adUsers = await adService.getUsers(filters?.ad);

          for (const adUser of adUsers) {
            try {
              const syncedUser = await syncUserFromExternal({
                employeeId: adUser.employeeId,
                employeeNumber: adUser.employeeNumber,
                name: adUser.displayName,
                email: adUser.mail,
                department: adUser.department,
                externalSource: "active_directory",
              });
              syncedUsers.push(syncedUser);
            } catch (error) {
              console.error(
                `Error syncing AD user ${adUser.employeeId}:`,
                error,
              );
              errors.push(
                `Failed to sync AD user ${adUser.employeeId}: ${error instanceof Error ? error.message : "Unknown error"}`,
              );
            }
          }
        } else {
          errors.push("Active Directory service not configured");
        }
      } catch (error) {
        console.error("Error fetching from Active Directory:", error);
        errors.push(
          `Active Directory sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    if (source === "sailpoint" || source === "all") {
      try {
        const sailPointService = createSailPointService();
        if (sailPointService) {
          const sailPointUsers = await sailPointService.getIdentities(
            filters?.sailpoint,
          );

          for (const spUser of sailPointUsers) {
            try {
              const syncedUser = await syncUserFromExternal({
                employeeId: spUser.employeeNumber || spUser.id,
                employeeNumber: spUser.employeeNumber,
                name: spUser.displayName,
                email: spUser.email,
                department: spUser.department,
                externalSource: "sailpoint",
              });
              syncedUsers.push(syncedUser);
            } catch (error) {
              console.error(
                `Error syncing SailPoint user ${spUser.id}:`,
                error,
              );
              errors.push(
                `Failed to sync SailPoint user ${spUser.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
              );
            }
          }
        } else {
          errors.push("SailPoint service not configured");
        }
      } catch (error) {
        console.error("Error fetching from SailPoint:", error);
        errors.push(
          `SailPoint sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    return NextResponse.json({
      success: true,
      syncedCount: syncedUsers.length,
      syncedUsers,
      errors,
    });
  } catch (error) {
    console.error("Error in external sync:", error);
    return NextResponse.json(
      {
        error: "Failed to sync users from external sources",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const testOnly = searchParams.get("test") === "true";

    const result: any = {
      availableSources: [],
      users: {},
    };

    // Check Active Directory
    const adService = createADService();
    if (adService) {
      result.availableSources.push("active_directory");
      if (!testOnly && (source === "active_directory" || source === "all")) {
        try {
          const adUsers = await adService.getUsers();
          result.users.active_directory = adUsers;
        } catch (error) {
          result.users.active_directory = {
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }
    }

    // Check SailPoint
    const sailPointService = createSailPointService();
    if (sailPointService) {
      result.availableSources.push("sailpoint");
      if (!testOnly && (source === "sailpoint" || source === "all")) {
        try {
          const spUsers = await sailPointService.getIdentities();
          result.users.sailpoint = spUsers;
        } catch (error) {
          result.users.sailpoint = {
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error checking external sources:", error);
    return NextResponse.json(
      { error: "Failed to check external sources" },
      { status: 500 },
    );
  }
}
