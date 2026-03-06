export type UserRole = "admin" | "vendor" | "staff";

export type AssetStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Needs Attention";

export interface Asset {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  department: string;
  quantityAvailable: number;
  minimumThreshold: number;
  unitCost: number;
  currentCondition: string;
  fundingSource: string;
  lastUpdated: string;
  notes: string;
  status: AssetStatus;
}

export interface StaffRequest {
  id: string;
  itemName: string;
  quantityNeeded: number;
  department: string;
  urgency: "Low" | "Medium" | "High" | "Critical";
  submittedBy: string;
  submittedAt: string;
  status: "New" | "Under Review" | "Approved" | "Ordered" | "Fulfilled" | "Denied";
  notes: string;
  type: "usage" | "shortage" | "request";
}

export type VendorType = "vendor" | "nonprofit" | "donor" | "partner";

export interface Vendor {
  id: string;
  organizationName: string;
  organizationType: VendorType;
  description: string;
  productsOffered: string[];
  servicesOffered: string[];
  categoriesSupported: string[];
  region: string;
  contactEmail: string;
  contactPhone: string;
  availabilityNotes: string;
  createdAt: string;
}

/** Columns expected in each department tab (department comes from sheet name). */
export const EXCEL_COLUMNS = [
  "Asset ID",
  "Asset Name",
  "Category",
  "Quantity Available",
  "Minimum Threshold",
  "Unit Cost",
  "Current Condition",
  "Funding Source",
  "Last Updated",
  "Notes",
] as const;

export type ExcelRow = Record<string, string | number>;
