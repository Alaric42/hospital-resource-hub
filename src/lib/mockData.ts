/**
 * Department names are determined by the Excel workbook tabs:
 * ICU, General Medicine, Emergency.
 * No mock hospital data — app starts empty until Excel is uploaded.
 */
export const EXPECTED_DEPARTMENTS = [
  "ICU",
  "General Medicine",
  "Emergency",
] as const;

export type ExpectedDepartment = (typeof EXPECTED_DEPARTMENTS)[number];
