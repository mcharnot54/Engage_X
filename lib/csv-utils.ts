export interface StandardCsvRow {
  organizationName: string;
  organizationCode: string;
  facilityName: string;
  facilityRef?: string;
  facilityCity?: string;
  departmentName: string;
  areaName: string;
  standardName: string;
  notes: string;
  // UOM entries (up to 75)
  [key: `uom${number}_name`]: string;
  [key: `uom${number}_description`]: string;
  [key: `uom${number}_samValue`]: string;
  [key: `uom${number}_tags`]: string;
  // Best practices (up to 20)
  [key: `bestPractice${number}`]: string;
  // Process opportunities (up to 20)
  [key: `processOpportunity${number}`]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ParsedStandardData {
  organizationName: string;
  organizationCode: string;
  facilityName: string;
  facilityRef?: string;
  facilityCity?: string;
  departmentName: string;
  areaName: string;
  standardName: string;
  notes: string;
  uomEntries: Array<{
    uom: string;
    description: string;
    samValue: number;
    tags: string[];
  }>;
  bestPractices: string[];
  processOpportunities: string[];
}

export const CSV_LIMITS = {
  MAX_UOM_ENTRIES: 75,
  MAX_BEST_PRACTICES: 20,
  MAX_PROCESS_OPPORTUNITIES: 20,
};

export function generateCsvTemplate(): string {
  const headers = [
    // Required hierarchy fields
    "organizationName",
    "organizationCode",
    "facilityName",
    "facilityRef",
    "facilityCity",
    "departmentName",
    "areaName",
    "standardName",
    "notes",
  ];

  // Add UOM headers (up to 75)
  for (let i = 1; i <= CSV_LIMITS.MAX_UOM_ENTRIES; i++) {
    headers.push(`uom${i}_name`);
    headers.push(`uom${i}_description`);
    headers.push(`uom${i}_samValue`);
    headers.push(`uom${i}_tags`);
  }

  // Add best practices headers (up to 20)
  for (let i = 1; i <= CSV_LIMITS.MAX_BEST_PRACTICES; i++) {
    headers.push(`bestPractice${i}`);
  }

  // Add process opportunities headers (up to 20)
  for (let i = 1; i <= CSV_LIMITS.MAX_PROCESS_OPPORTUNITIES; i++) {
    headers.push(`processOpportunity${i}`);
  }

  // Create sample row
  const sampleRow = [
    "Example Organization",
    "EXO",
    "Main Facility",
    "FAC001",
    "New York",
    "Production",
    "Assembly Line A",
    "Widget Assembly Standard",
    "Additional notes about this standard",
  ];

  // Add sample UOM data for first few entries
  sampleRow.push(
    "Units",
    "Number of units produced",
    "0.5",
    "Production;Quality",
  );
  sampleRow.push("Minutes", "Time spent on task", "1.2", "Time;Efficiency");
  sampleRow.push("Pieces", "Components assembled", "0.8", "Assembly");

  // Fill remaining UOM slots with empty values
  const remainingUomSlots = (CSV_LIMITS.MAX_UOM_ENTRIES - 3) * 4;
  for (let i = 0; i < remainingUomSlots; i++) {
    sampleRow.push("");
  }

  // Add sample best practices
  sampleRow.push("Follow safety protocols at all times");
  sampleRow.push("Maintain clean workspace");
  sampleRow.push("Use proper lifting techniques");

  // Fill remaining best practice slots
  for (let i = 3; i < CSV_LIMITS.MAX_BEST_PRACTICES; i++) {
    sampleRow.push("");
  }

  // Add sample process opportunities
  sampleRow.push("Implement visual management system");
  sampleRow.push("Standardize tool placement");

  // Fill remaining process opportunity slots
  for (let i = 2; i < CSV_LIMITS.MAX_PROCESS_OPPORTUNITIES; i++) {
    sampleRow.push("");
  }

  return [formatCsvLine(headers), formatCsvLine(sampleRow)].join("\n");
}

// Helper function to properly format CSV lines with proper escaping
function formatCsvLine(values: string[]): string {
  return values
    .map((value) => {
      const stringValue = String(value);
      // If value contains comma, quote, or newline, wrap in quotes and escape existing quotes
      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    })
    .join(",");
}

export function parseCsvContent(csvContent: string): StandardCsvRow[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV must contain at least a header row and one data row");
  }

  const headers = parseCsvLine(lines[0]);
  const rows: StandardCsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: any = {};

    headers.forEach((header, index) => {
      row[header.trim()] = values[index] || "";
    });

    rows.push(row as StandardCsvRow);
  }

  return rows;
}

// Helper function to properly parse CSV lines with quoted fields
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Handle escaped quotes
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim());

  return result;
}

export function validateStandardRow(
  row: StandardCsvRow,
  rowIndex: number,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  const requiredFields = [
    "organizationName",
    "organizationCode",
    "facilityName",
    "departmentName",
    "areaName",
    "standardName",
    "notes",
  ];

  requiredFields.forEach((field) => {
    if (
      !row[field as keyof StandardCsvRow] ||
      (row[field as keyof StandardCsvRow] as string).trim() === ""
    ) {
      errors.push(`Row ${rowIndex + 1}: Missing required field '${field}'`);
    }
  });

  // Validate UOM entries
  let uomCount = 0;
  for (let i = 1; i <= CSV_LIMITS.MAX_UOM_ENTRIES; i++) {
    const uomName = row[`uom${i}_name` as keyof StandardCsvRow] as string;
    const uomDesc = row[
      `uom${i}_description` as keyof StandardCsvRow
    ] as string;
    const uomSam = row[`uom${i}_samValue` as keyof StandardCsvRow] as string;

    if (uomName || uomDesc || uomSam) {
      uomCount++;

      if (!uomName?.trim()) {
        errors.push(
          `Row ${rowIndex + 1}: UOM ${i} has description or SAM value but missing name`,
        );
      }
      if (!uomDesc?.trim()) {
        errors.push(
          `Row ${rowIndex + 1}: UOM ${i} has name or SAM value but missing description`,
        );
      }
      if (!uomSam?.trim()) {
        errors.push(
          `Row ${rowIndex + 1}: UOM ${i} has name or description but missing SAM value`,
        );
      } else {
        const samValue = parseFloat(uomSam);
        if (isNaN(samValue) || samValue <= 0) {
          errors.push(
            `Row ${rowIndex + 1}: UOM ${i} SAM value must be a positive number`,
          );
        }
      }
    }
  }

  if (uomCount === 0) {
    warnings.push(
      `Row ${rowIndex + 1}: No UOM entries found, standard will have no measurable units`,
    );
  }

  // Count best practices
  let bestPracticeCount = 0;
  for (let i = 1; i <= CSV_LIMITS.MAX_BEST_PRACTICES; i++) {
    const practice = row[`bestPractice${i}` as keyof StandardCsvRow] as string;
    if (practice?.trim()) {
      bestPracticeCount++;
    }
  }

  // Count process opportunities
  let processOpportunityCount = 0;
  for (let i = 1; i <= CSV_LIMITS.MAX_PROCESS_OPPORTUNITIES; i++) {
    const opportunity = row[
      `processOpportunity${i}` as keyof StandardCsvRow
    ] as string;
    if (opportunity?.trim()) {
      processOpportunityCount++;
    }
  }

  if (bestPracticeCount === 0) {
    warnings.push(`Row ${rowIndex + 1}: No best practices defined`);
  }

  if (processOpportunityCount === 0) {
    warnings.push(`Row ${rowIndex + 1}: No process opportunities defined`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function transformRowToStandardData(
  row: StandardCsvRow,
): ParsedStandardData {
  // Extract UOM entries
  const uomEntries = [];
  for (let i = 1; i <= CSV_LIMITS.MAX_UOM_ENTRIES; i++) {
    const uomName = row[`uom${i}_name` as keyof StandardCsvRow] as string;
    const uomDesc = row[
      `uom${i}_description` as keyof StandardCsvRow
    ] as string;
    const uomSam = row[`uom${i}_samValue` as keyof StandardCsvRow] as string;
    const uomTags = row[`uom${i}_tags` as keyof StandardCsvRow] as string;

    if (uomName?.trim() && uomDesc?.trim() && uomSam?.trim()) {
      uomEntries.push({
        uom: uomName.trim(),
        description: uomDesc.trim(),
        samValue: parseFloat(uomSam),
        tags: uomTags
          ? uomTags
              .split(/[;,]/) // Split on both semicolon and comma
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
      });
    }
  }

  // Extract best practices
  const bestPractices = [];
  for (let i = 1; i <= CSV_LIMITS.MAX_BEST_PRACTICES; i++) {
    const practice = row[`bestPractice${i}` as keyof StandardCsvRow] as string;
    if (practice?.trim()) {
      bestPractices.push(practice.trim());
    }
  }

  // Extract process opportunities
  const processOpportunities = [];
  for (let i = 1; i <= CSV_LIMITS.MAX_PROCESS_OPPORTUNITIES; i++) {
    const opportunity = row[
      `processOpportunity${i}` as keyof StandardCsvRow
    ] as string;
    if (opportunity?.trim()) {
      processOpportunities.push(opportunity.trim());
    }
  }

  return {
    organizationName: row.organizationName.trim(),
    organizationCode: row.organizationCode.trim(),
    facilityName: row.facilityName.trim(),
    facilityRef: row.facilityRef?.trim() || undefined,
    facilityCity: row.facilityCity?.trim() || undefined,
    departmentName: row.departmentName.trim(),
    areaName: row.areaName.trim(),
    standardName: row.standardName.trim(),
    notes: row.notes?.trim() || "",
    uomEntries,
    bestPractices,
    processOpportunities,
  };
}
