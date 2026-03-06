import * as XLSX from "xlsx";
import { EXCEL_COLUMNS } from "./types";
import { Asset, AssetStatus } from "./types";
import { getAssetStatus } from "./utils";
import { generateId } from "./utils";
import { EXPECTED_DEPARTMENTS } from "./mockData";

/** Required workbook tab names = department names. */
export const REQUIRED_SHEET_NAMES = [...EXPECTED_DEPARTMENTS] as const;

function num(val: unknown): number {
  if (typeof val === "number" && !Number.isNaN(val)) return val;
  if (typeof val === "string") {
    const n = parseFloat(val.replace(/[^0-9.-]/g, ""));
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function str(val: unknown): string {
  if (val == null) return "";
  return String(val).trim();
}

function dateStr(val: unknown): string {
  if (val == null) return "";
  if (typeof val === "number" && val > 0) {
    try {
      const d = new Date((val - 25569) * 86400 * 1000);
      if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    } catch {
      // ignore
    }
  }
  return str(val);
}

/** Normalize sheet name for matching (trim, collapse spaces). */
function normalizeSheetName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export interface SheetSummary {
  sheetName: string;
  department: string;
  rowCount: number;
  validRecordCount: number;
}

export interface ParseResult {
  assets: Asset[];
  errors: { sheet?: string; row?: number; message: string }[];
  missingTabs: string[];
  sheetSummaries: SheetSummary[];
  detectedDepartments: string[];
}

/**
 * Parse a single sheet and assign department from the sheet name.
 * Ignores any "Department" column in the sheet; tab name is source of truth.
 */
function parseSheet(
  sheet: XLSX.WorkSheet,
  sheetName: string,
  department: string
): { assets: Asset[]; errors: ParseResult["errors"] } {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
  const errors: ParseResult["errors"] = [];
  const assets: Asset[] = [];

  if (rows.length === 0) {
    errors.push({ sheet: sheetName, message: `No data rows were found in the ${sheetName} tab.` });
    return { assets, errors };
  }

  const headers = Object.keys(rows[0] ?? {}).map((h) => String(h).trim());
  const hasAssetId = headers.some((h) => h === "Asset ID" || h === "assetId");
  const hasAssetName = headers.some((h) => h === "Asset Name" || h === "assetName");
  if (!hasAssetId && !hasAssetName) {
    errors.push({
      sheet: sheetName,
      message: `The ${sheetName} tab is missing required columns (e.g. Asset ID, Asset Name).`,
    });
    return { assets, errors };
  }

  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const assetId = str(row["Asset ID"] ?? row["assetId"]);
    const assetName = str(row["Asset Name"] ?? row["assetName"]);
    if (!assetId && !assetName) return;

    const quantityAvailable = num(row["Quantity Available"] ?? row["quantityAvailable"]);
    const minimumThreshold = num(row["Minimum Threshold"] ?? row["minimumThreshold"]);
    const status: AssetStatus = getAssetStatus(quantityAvailable, minimumThreshold);

    assets.push({
      id: generateId(),
      assetId: assetId || `AST-${department.replace(/\s/g, "-")}-${rowNum}`,
      assetName: assetName || "Unnamed",
      category: str(row["Category"] ?? row["category"]),
      department,
      quantityAvailable,
      minimumThreshold,
      unitCost: num(row["Unit Cost"] ?? row["unitCost"]),
      currentCondition: str(row["Current Condition"] ?? row["currentCondition"]),
      fundingSource: str(row["Funding Source"] ?? row["fundingSource"]),
      lastUpdated:
        dateStr(row["Last Updated"] ?? row["lastUpdated"]) ||
        new Date().toISOString().slice(0, 10),
      notes: str(row["Notes"] ?? row["notes"]),
      status,
    });
  });

  return { assets, errors };
}

export function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({
            assets: [],
            errors: [{ message: "Could not read the file." }],
            missingTabs: [...REQUIRED_SHEET_NAMES],
            sheetSummaries: [],
            detectedDepartments: [],
          });
          return;
        }

        const workbook = XLSX.read(data, { type: "binary" });
        const sheetNames = workbook.SheetNames.map((n) => n.trim());
        const normalizedToOriginal = new Map<string, string>();
        sheetNames.forEach((n) => normalizedToOriginal.set(normalizeSheetName(n), n));

        const missingTabs: string[] = [];
        const detectedDepartments: string[] = [];
        const sheetSummaries: SheetSummary[] = [];
        const allAssets: Asset[] = [];
        const errors: ParseResult["errors"] = [];

        for (const required of REQUIRED_SHEET_NAMES) {
          const normalizedRequired = normalizeSheetName(required);
          const originalName = normalizedToOriginal.get(normalizedRequired);
          if (!originalName) {
            missingTabs.push(required);
            continue;
          }

          detectedDepartments.push(required);
          const sheet = workbook.Sheets[originalName];
          if (!sheet) {
            errors.push({ sheet: required, message: `The ${required} tab could not be read.` });
            sheetSummaries.push({
              sheetName: required,
              department: required,
              rowCount: 0,
              validRecordCount: 0,
            });
            continue;
          }

          const { assets: sheetAssets, errors: sheetErrors } = parseSheet(
            sheet,
            originalName,
            required
          );
          errors.push(...sheetErrors);
          allAssets.push(...sheetAssets);
          sheetSummaries.push({
            sheetName: originalName,
            department: required,
            rowCount: XLSX.utils.sheet_to_json(sheet).length,
            validRecordCount: sheetAssets.length,
          });
        }

        if (missingTabs.length > 0) {
          errors.unshift({
            message: `Your workbook must include the tabs: ${REQUIRED_SHEET_NAMES.join(", ")}. Missing: ${missingTabs.join(", ")}.`,
          });
        }

        if (allAssets.length === 0 && errors.every((e) => !e.message.includes("required columns"))) {
          const hasSheets = detectedDepartments.length > 0;
          if (hasSheets) {
            errors.push({
              message: "No valid asset records were found in any of the department tabs. Check that each tab has a header row and at least one data row with Asset ID or Asset Name.",
            });
          }
        }

        resolve({
          assets: allAssets,
          errors,
          missingTabs,
          sheetSummaries,
          detectedDepartments,
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsBinaryString(file);
  });
}

/** Download a template workbook with 3 tabs: ICU, General Medicine, Emergency. */
export function downloadTemplate() {
  const headers = [...EXCEL_COLUMNS];
  const today = new Date().toISOString().slice(0, 10);

  const wb = XLSX.utils.book_new();

  const icuRows = [
    ["AST-ICU-001", "Ventilators", "Life Support", 12, 10, 25000, "Good", "State Grant", today, "ICU equipment"],
  ];
  const gmRows = [
    ["AST-GM-001", "IV Pumps", "Medical Equipment", 8, 15, 1200, "Good", "Hospital Budget", today, ""],
  ];
  const emRows = [
    ["AST-EM-001", "PPE Kits", "PPE & Supplies", 0, 50, 25, "N/A", "Federal", today, "Urgent restock"],
  ];

  const wsIcu = XLSX.utils.aoa_to_sheet([headers, ...icuRows]);
  const wsGm = XLSX.utils.aoa_to_sheet([headers, ...gmRows]);
  const wsEm = XLSX.utils.aoa_to_sheet([headers, ...emRows]);

  XLSX.utils.book_append_sheet(wb, wsIcu, "ICU");
  XLSX.utils.book_append_sheet(wb, wsGm, "General Medicine");
  XLSX.utils.book_append_sheet(wb, wsEm, "Emergency");

  XLSX.writeFile(wb, "hospital_assets_template.xlsx");
}
