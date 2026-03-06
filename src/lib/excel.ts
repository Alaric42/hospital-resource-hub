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

/** Normalize sheet name for matching (trim, collapse spaces, lowercase for case-insensitive match). */
function normalizeSheetName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Tab name aliases: "Emergency Medicine" tab is accepted as department "Emergency". */
const SHEET_NAME_ALIASES: Record<string, string> = {
  "emergency medicine": "Emergency",
};

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

/** Get cell value for a column: match sheet headers to aliases, then read from row. */
function getRowValue(row: Record<string, unknown>, aliases: string[], allKeys: string[]): unknown {
  const normalizedToKey = new Map<string, string>();
  allKeys.forEach((k) => normalizedToKey.set(k.trim().toLowerCase().replace(/\s+/g, " "), k));
  for (const a of aliases) {
    const key = normalizedToKey.get(a);
    if (key !== undefined) {
      const val = row[key];
      if (val !== undefined && val !== "") return val;
    }
  }
  return undefined;
}

/** Check if the first row looks like a title row (e.g. "ICU", "Family Medicine" in first cell only). */
function isTitleRow(row: unknown[], departmentNames: string[]): boolean {
  const firstCell = str(row?.[0]);
  if (!firstCell) return false;
  const n = firstCell.toLowerCase().replace(/\s+/g, " ");
  const isDeptTitle = departmentNames.some((d) => d.toLowerCase().replace(/\s+/g, " ") === n) || n === "emergency medicine";
  if (!isDeptTitle) return false;
  const restOfRow = (row as unknown[]).slice(1).map((c) => String(c ?? "").toLowerCase());
  const hasAssetHeader = restOfRow.some((c) => c.includes("asset id") || c.includes("asset name") || c === "asset id" || c === "asset name");
  return !hasAssetHeader;
}

/** Build a row object from header strings and cell values (by index). */
function rowFromArrays(headers: string[], values: unknown[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  headers.forEach((h, i) => {
    if (h != null && String(h).trim()) obj[String(h).trim()] = values[i];
  });
  return obj;
}

/**
 * Parse a single sheet. Supports two layouts:
 * - Row 1 = headers, Row 2+ = data (or Row 1 first cell = title like "ICU", then B1:K1 = headers).
 * - Row 1 = title only (e.g. "Family Medicine"), Row 2 = headers, Row 3+ = data.
 * Department is set from the sheet/tab name.
 */
function parseSheet(
  sheet: XLSX.WorkSheet,
  sheetName: string,
  department: string
): { assets: Asset[]; errors: ParseResult["errors"] } {
  const errors: ParseResult["errors"] = [];
  const assets: Asset[] = [];

  const rowsArray = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: false });
  if (rowsArray.length === 0) {
    errors.push({ sheet: sheetName, message: `No data rows were found in the ${sheetName} tab.` });
    return { assets, errors };
  }

  const departmentNames = ["icu", "family medicine", "emergency", "emergency medicine"];
  const isTitle = rowsArray.length > 1 && isTitleRow(rowsArray[0], departmentNames);
  const headerRowIndex = isTitle ? 1 : 0;
  const dataStartIndex = isTitle ? 2 : 1;

  const headerRow = rowsArray[headerRowIndex] ?? [];
  const headers = (headerRow as unknown[]).map((c) => String(c ?? "").trim());
  const allKeys = headers.filter(Boolean);
  const normalizedKeys = allKeys.map((k) => k.toLowerCase().replace(/\s+/g, " "));

  const hasAssetId = ["asset id", "assetid"].some((a) => normalizedKeys.some((n) => n === a || n.includes("asset id")));
  const hasAssetName = ["asset name", "assetname"].some((a) => normalizedKeys.some((n) => n === a || n.includes("asset name")));
  if (!hasAssetId && !hasAssetName) {
    errors.push({
      sheet: sheetName,
      message: `The ${sheetName} tab is missing required columns (e.g. Asset ID, Asset Name). Headers found: ${allKeys.join(", ") || "(none)"}.`,
    });
    return { assets, errors };
  }

  const dataRows = rowsArray.slice(dataStartIndex);
  dataRows.forEach((values, index) => {
    const row = rowFromArrays(headers, values as unknown[]);
    const rowNum = dataStartIndex + index + 1;
    const assetId = str(getRowValue(row, ["asset id", "assetid"], allKeys));
    const assetName = str(getRowValue(row, ["asset name", "assetname"], allKeys));
    if (!assetId && !assetName) return;

    const quantityAvailable = num(getRowValue(row, ["quantity available", "quantityavailable", "qty", "quantity"], allKeys));
    const minimumThreshold = num(getRowValue(row, ["minimum threshold", "minimumthreshold", "threshold", "min threshold"], allKeys));
    const status: AssetStatus = getAssetStatus(quantityAvailable, minimumThreshold);

    assets.push({
      id: generateId(),
      assetId: assetId || `AST-${department.replace(/\s/g, "-")}-${rowNum}`,
      assetName: assetName || "Unnamed",
      category: str(getRowValue(row, ["category"], allKeys)),
      department,
      quantityAvailable,
      minimumThreshold,
      unitCost: num(getRowValue(row, ["unit cost", "unit cost ($)", "unitcost", "cost"], allKeys)),
      currentCondition: str(getRowValue(row, ["current condition", "currentcondition", "condition"], allKeys)),
      fundingSource: str(getRowValue(row, ["funding source", "fundingsource", "funding"], allKeys)),
      lastUpdated:
        dateStr(getRowValue(row, ["last updated", "lastupdated", "last update", "date"], allKeys)) ||
        new Date().toISOString().slice(0, 10),
      notes: str(getRowValue(row, ["notes"], allKeys)),
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
          let originalName = normalizedToOriginal.get(normalizedRequired);
          if (!originalName) {
            const aliasKey = Object.keys(SHEET_NAME_ALIASES).find((alias) => normalizedToOriginal.get(alias) && SHEET_NAME_ALIASES[alias] === required);
            if (aliasKey) originalName = normalizedToOriginal.get(aliasKey);
          }
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

/** Download a template workbook with 3 tabs: ICU, Family Medicine, Emergency. */
export function downloadTemplate() {
  const headers = [...EXCEL_COLUMNS];
  const today = new Date().toISOString().slice(0, 10);

  const wb = XLSX.utils.book_new();

  const icuRows = [
    ["AST-ICU-001", "Ventilators", "Life Support", 12, 10, 25000, "Good", "State Grant", today, "ICU equipment"],
  ];
  const fmRows = [
    ["AST-FM-001", "IV Pumps", "Medical Equipment", 8, 15, 1200, "Good", "Hospital Budget", today, ""],
  ];
  const emRows = [
    ["AST-EM-001", "PPE Kits", "PPE & Supplies", 0, 50, 25, "N/A", "Federal", today, "Urgent restock"],
  ];

  const wsIcu = XLSX.utils.aoa_to_sheet([headers, ...icuRows]);
  const wsFm = XLSX.utils.aoa_to_sheet([headers, ...fmRows]);
  const wsEm = XLSX.utils.aoa_to_sheet([headers, ...emRows]);

  XLSX.utils.book_append_sheet(wb, wsIcu, "ICU");
  XLSX.utils.book_append_sheet(wb, wsFm, "Family Medicine");
  XLSX.utils.book_append_sheet(wb, wsEm, "Emergency");

  XLSX.writeFile(wb, "hospital_assets_template.xlsx");
}
