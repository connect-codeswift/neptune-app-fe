import type { MetricCardProps } from "@/components/ui/MetricCard";

export type PpeSiteId = "plant-a" | "plant-b" | "whse-1" | "whse-2";

export type PpeInventoryItem = Readonly<{
  id: string;
  /** Primary row label — maps from API `itemName`. */
  category: string;
  /** Protection type — maps from API `category`. */
  protectionType?: string;
  /** Available units — maps from API `inStock`. */
  onHand: number;
  /** Fill percent 0–100 (on hand vs on hand + issued). */
  stockLevel: number;
  /** Denominator used for stock-level display (on hand + issued). */
  stockCapacity: number;
  /** Maps from API `isUsed`. */
  currentlyIssued: number;
  reorderDate: string;
  supplier: string;
  /** Soft-alert row (e.g. critical kit / due soon). */
  attention?: boolean;
  sites: readonly PpeSiteId[];
}>;

export type PpeMetric = MetricCardProps;

export type PpeCatalogStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type PpeIssuanceRecord = Readonly<{
  id: string;
  employeeId: string;
  employee: string;
  quantity: number;
  size: string;
  issueDate: string;
  status: string;
}>;

export type PpeCatalogDetail = Readonly<{
  id: string;
  name: string;
  protectionType: string;
  standard: string;
  supplier: string;
  status: PpeCatalogStatus;
  description: string;
  category: string;
  unitCost: string;
  replaceAfter: string;
  inspectionInterval: string;
  availableSizes: string;
  inStock: number;
  minLevel: number;
  currentlyIssued: number;
  onOrder: number;
  issuances: readonly PpeIssuanceRecord[];
}>;

export type PpeActiveItem = Readonly<{
  id: string;
  catalogId: string;
  name: string;
  summary: string;
  status: "Issued" | "Returned" | "Overdue";
  /** Show Inspect action when true. */
  canInspect?: boolean;
}>;

export type PpeHistoryRecord = Readonly<{
  id: string;
  item: string;
  quantity: number;
  issueDate: string;
  returnDate: string;
  condition: string;
  status: "Issued" | "Returned" | "Overdue";
}>;

export type PpeEmployeeProfile = Readonly<{
  id: string;
  name: string;
  initials: string;
  role: string;
  department: string;
  employeeCode: string;
  activeItems: readonly PpeActiveItem[];
  history: readonly PpeHistoryRecord[];
}>;

export type PpeLogStatus = "Issued" | "Due Inspection" | "Overdue" | "Returned";

export type PpeIssuanceLogEntry = Readonly<{
  id: string;
  issueId: string;
  employee: string;
  ppeItem: string;
  qtySize: string;
  issueDate: string;
  returnDate: string;
  condition: string;
  status: PpeLogStatus;
  canReturn: boolean;
}>;

/** One row on My PPE Acknowledgements (Figma 5124:42603). */
export type PpeAcknowledgementEntry = Readonly<{
  id: string;
  issueNumericId: number;
  assignToName: string;
  initials: string;
  item: string;
  quantity: string;
  size: string;
  note: string;
  acknowledged: boolean;
  siteId: number | null;
}>;
