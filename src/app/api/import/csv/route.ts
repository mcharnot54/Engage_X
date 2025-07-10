import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const tableType = formData.get("tableType") as string;
    const neonProjectId = formData.get("neonProjectId") as string;
    const neonDatabaseUrl = formData.get("neonDatabaseUrl") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!tableType) {
      return NextResponse.json(
        { error: "No table type specified" },
        { status: 400 },
      );
    }

    if (!neonProjectId && !neonDatabaseUrl) {
      return NextResponse.json(
        { error: "Either Neon project ID or database URL is required" },
        { status: 400 },
      );
    }

    const csvContent = await file.text();
    const lines = csvContent.trim().split("\n");

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV must contain at least a header row and one data row" },
        { status: 400 },
      );
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const rows = lines.slice(1).map((line) => {
      const values = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i - 1] === ",")) {
          inQuotes = true;
        } else if (
          char === '"' &&
          (i === line.length - 1 || line[i + 1] === ",")
        ) {
          inQuotes = false;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
      return values;
    });

    // Import using Neon connection
    const { Client } = await import("pg");

    const connectionString = neonDatabaseUrl;
    if (!connectionString && neonProjectId) {
      // This would need to be implemented to get connection string from project ID
      return NextResponse.json(
        { error: "Please provide the full Neon database URL" },
        { status: 400 },
      );
    }

    const client = new Client({
      connectionString: connectionString,
      ssl: true,
    });

    try {
      await client.connect();

      let insertedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          await importRowToNeon(client, tableType, headers, row);
          insertedCount++;
        } catch (error: any) {
          errors.push(`Row ${i + 2}: ${error.message}`);
        }
      }

      await client.end();

      return NextResponse.json({
        success: true,
        imported: insertedCount,
        total: rows.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error: any) {
      await client.end();
      throw error;
    }
  } catch (error: any) {
    console.error("Error importing CSV:", error);
    return NextResponse.json(
      { error: `Failed to import CSV: ${error.message}` },
      { status: 500 },
    );
  }
}

async function importRowToNeon(
  client: any,
  tableType: string,
  headers: string[],
  values: string[],
) {
  const data: any = {};
  headers.forEach((header, index) => {
    data[header] = values[index] || null;
  });

  switch (tableType) {
    case "organizations":
      await client.query(
        `INSERT INTO organizations (name, code, logo, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, NOW(), NOW()) 
         ON CONFLICT (code) DO UPDATE SET 
         name = EXCLUDED.name, 
         logo = EXCLUDED.logo, 
         "updatedAt" = NOW()`,
        [data.name, data.code, data.logo || null],
      );
      break;

    case "facilities":
      // First ensure organization exists
      const orgResult = await client.query(
        `SELECT id FROM organizations WHERE name = $1 OR code = $1`,
        [data.organizationName],
      );

      if (orgResult.rows.length === 0) {
        throw new Error(`Organization '${data.organizationName}' not found`);
      }

      const organizationId = orgResult.rows[0].id;

      await client.query(
        `INSERT INTO facilities (name, ref, city, "organizationId", "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (name, "organizationId") DO UPDATE SET
         ref = EXCLUDED.ref,
         city = EXCLUDED.city,
         "updatedAt" = NOW()`,
        [
          data.facilityName,
          data.ref || null,
          data.city || null,
          organizationId,
        ],
      );
      break;

    case "departments":
      // Find facility
      const facilityResult = await client.query(
        `SELECT f.id FROM facilities f 
         JOIN organizations o ON f."organizationId" = o.id 
         WHERE f.name = $1 AND o.name = $2`,
        [data.facilityName, data.organizationName],
      );

      if (facilityResult.rows.length === 0) {
        throw new Error(
          `Facility '${data.facilityName}' not found in organization '${data.organizationName}'`,
        );
      }

      const facilityId = facilityResult.rows[0].id;

      await client.query(
        `INSERT INTO departments (name, "facilityId", "createdAt", "updatedAt") 
         VALUES ($1, $2, NOW(), NOW())
         ON CONFLICT (name, "facilityId") DO UPDATE SET
         "updatedAt" = NOW()`,
        [data.departmentName, facilityId],
      );
      break;

    case "areas":
      // Find department
      const deptResult = await client.query(
        `SELECT d.id FROM departments d 
         JOIN facilities f ON d."facilityId" = f.id 
         JOIN organizations o ON f."organizationId" = o.id 
         WHERE d.name = $1 AND f.name = $2 AND o.name = $3`,
        [data.departmentName, data.facilityName, data.organizationName],
      );

      if (deptResult.rows.length === 0) {
        throw new Error(`Department '${data.departmentName}' not found`);
      }

      const departmentId = deptResult.rows[0].id;

      await client.query(
        `INSERT INTO areas (name, "departmentId", "createdAt", "updatedAt") 
         VALUES ($1, $2, NOW(), NOW())
         ON CONFLICT (name, "departmentId") DO UPDATE SET
         "updatedAt" = NOW()`,
        [data.areaName, departmentId],
      );
      break;

    case "standards":
      // Find organization, facility, department, and area
      const locationResult = await client.query(
        `SELECT f.id as facility_id, d.id as department_id, a.id as area_id
         FROM organizations o
         JOIN facilities f ON f."organizationId" = o.id
         JOIN departments dep ON dep."facilityId" = f.id
         JOIN areas a ON a."departmentId" = dep.id
         WHERE o.name = $1 AND f.name = $2 AND dep.name = $3 AND a.name = $4`,
        [
          data.organizationName,
          data.facilityName,
          data.departmentName,
          data.areaName,
        ],
      );

      if (locationResult.rows.length === 0) {
        throw new Error(
          `Location not found: ${data.organizationName} > ${data.facilityName} > ${data.departmentName} > ${data.areaName}`,
        );
      }

      const location = locationResult.rows[0];

      // Parse arrays and objects
      const bestPractices = data.bestPractices
        ? data.bestPractices
            .split(";")
            .map((s: string) => s.trim())
            .filter((s: string) => s)
        : [];
      const processOpportunities = data.processOpportunities
        ? data.processOpportunities
            .split(";")
            .map((s: string) => s.trim())
            .filter((s: string) => s)
        : [];

      // Insert standard
      const standardResult = await client.query(
        `INSERT INTO standards (name, "facilityId", "departmentId", "areaId", "bestPractices", "processOpportunities", version, "isCurrentVersion", "versionNotes", "createdBy", "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         RETURNING id`,
        [
          data.standardName || data.name,
          location.facility_id,
          location.department_id,
          location.area_id,
          bestPractices,
          processOpportunities,
          parseInt(data.version) || 1,
          data.isCurrentVersion === "true" || data.isCurrentVersion === true,
          data.versionNotes || null,
          data.createdBy || null,
        ],
      );

      const standardId = standardResult.rows[0].id;

      // Parse and insert UOM entries if present
      if (data.uomEntries) {
        try {
          const uomEntries = JSON.parse(data.uomEntries);
          for (const uomEntry of uomEntries) {
            await client.query(
              `INSERT INTO uom_entries (uom, description, "samValue", tags, "standardId", "createdAt", "updatedAt") 
               VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
              [
                uomEntry.uom,
                uomEntry.description,
                parseFloat(uomEntry.samValue),
                uomEntry.tags || [],
                standardId,
              ],
            );
          }
        } catch (error) {
          console.warn(
            `Failed to parse UOM entries for standard ${data.standardName}:`,
            error,
          );
        }
      }
      break;

    case "users":
      await client.query(
        `INSERT INTO users ("employeeId", "employeeNumber", name, email, department, role, "roleId", "isActive", "lastSyncAt", "externalSource", "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         ON CONFLICT ("employeeId") DO UPDATE SET
         name = EXCLUDED.name,
         email = EXCLUDED.email,
         department = EXCLUDED.department,
         role = EXCLUDED.role,
         "isActive" = EXCLUDED."isActive",
         "updatedAt" = NOW()`,
        [
          data.employeeId,
          data.employeeNumber || null,
          data.name,
          data.email || null,
          data.department || null,
          data.role || null,
          data.roleId || null,
          data.isActive === "true" || data.isActive === true,
          data.lastSyncAt ? new Date(data.lastSyncAt) : null,
          data.externalSource || null,
        ],
      );
      break;

    default:
      throw new Error(`Unsupported table type: ${tableType}`);
  }
}
