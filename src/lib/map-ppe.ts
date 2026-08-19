import type { SelectOption } from "@/components/form-builder";
import type {
  PpeActiveItem,
  PpeAcknowledgementEntry,
  PpeCatalogDetail,
  PpeCatalogStatus,
  PpeEmployeeProfile,
  PpeHistoryRecord,
  PpeInventoryItem,
  PpeIssuanceDetail,
  PpeIssuanceLogEntry,
  PpeIssuanceRecord,
  PpeLogStatus,
  PpeMetric,
} from "@/app/dashboard/ppe-management/ppe-data";
import type {
  PpeIssueDetailDto,
  PpeIssueDto,
  PpeItemDto,
  PpeKpiDto,
} from "@/dtos/res/ppe-response.dto";
import { formatRecordDisplayId } from "@/lib/format-record-id";

/** Display form of a PPE catalog id, e.g. `1008` → `"PPE-1008"`. */
export function formatPpeDisplayId(
  id: string | number | null | undefined,
): string {
  return formatRecordDisplayId("PPE", id);
}

/** Turn GET /api/ppe rows into select options for the issue form. */
export function toPpeItemOptions(items: readonly PpeItemDto[]): SelectOption[] {
  return items.flatMap((item) => {
    if (item.id === undefined) return [];

    const label =
      item.category ??
      item.item ??
      item.name ??
      item.itemName ??
      `PPE ${String(item.id)}`;

    return [{ value: String(item.id), label }];
  });
}

/**
 * Turn GET /api/ppe rows into chip options for a required-PPE picker
 * (LOTO procedure). Value is the catalog id; label is the item's display name,
 * sorted so the chip order does not shift with API row order.
 */
export function toPpeChipOptions(items: readonly PpeItemDto[]): SelectOption[] {
  return items
    .flatMap((item) =>
      item.id === undefined
        ? []
        : [{ value: String(item.id), label: toItemDisplayName(item) }],
    )
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** Parse comma-separated sizes (e.g. "S,M,L,XL,XXL") into select options. */
function toPpeSizeOptions(availableSize?: string | null): SelectOption[] {
  if (!availableSize?.trim()) return [];

  return availableSize
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean)
    .map((size) => ({
      value: size.toLowerCase().replace(/\s+/g, "-"),
      label: size,
    }));
}

/** Size options for the currently selected PPE item id. */
export function toPpeSizeOptionsForItem(
  items: readonly PpeItemDto[] | undefined,
  ppeItemId: string,
): SelectOption[] {
  if (!ppeItemId) return [];

  const item = items?.find((entry) => String(entry.id) === ppeItemId);
  return toPpeSizeOptions(item?.availableSize);
}

function isLowStock(item: PpeItemDto): boolean {
  const inStock = item.inStock ?? 0;
  const minStock = item.minStock ?? 0;

  if (minStock > 0 && inStock <= minStock) {
    return true;
  }

  const status = item.stockStatus?.toLowerCase() ?? "";
  return status.includes("low") || status.includes("out");
}

/** On-hand share of (on hand + issued), clamped 0–100. */
function toStockLevel(
  onHand: number,
  currentlyIssued: number,
): {
  stockLevel: number;
  stockCapacity: number;
} {
  const stockCapacity = Math.max(onHand + currentlyIssued, 1);
  const stockLevel = Math.min(100, Math.round((onHand / stockCapacity) * 100));

  return { stockLevel, stockCapacity };
}

function toCatalogStatus(item: PpeItemDto): PpeCatalogStatus {
  const raw = (item.status ?? item.stockStatus ?? "").toLowerCase();

  if (raw.includes("out")) return "Out of Stock";
  if (raw.includes("low")) return "Low Stock";

  const inStock = item.inStock ?? 0;
  const minStock = item.minStock ?? 0;

  if (inStock <= 0) return "Out of Stock";
  if (minStock > 0 && inStock <= minStock) return "Low Stock";

  return "In Stock";
}

function toItemDisplayName(item: PpeItemDto): string {
  return (
    item.itemName?.trim() ||
    item.item?.trim() ||
    item.name?.trim() ||
    item.category?.trim() ||
    (item.id !== undefined ? `PPE ${String(item.id)}` : "PPE item")
  );
}

function toUnitCostLabel(unitCost: number | undefined): string {
  if (unitCost === undefined || !Number.isFinite(unitCost)) return "—";

  return unitCost.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function toAvailableSizesLabel(availableSize?: string | null): string {
  if (!availableSize?.trim()) return "—";

  return availableSize
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean)
    .join(" / ");
}

function toCatalogDescription(item: PpeItemDto): string {
  const parts: string[] = [];

  if (item.modelNumber?.trim()) {
    parts.push(`Model ${item.modelNumber.trim()}`);
  }

  if (item.manufacturer?.trim()) {
    parts.push(`Manufacturer: ${item.manufacturer.trim()}`);
  }

  if (item.hazardTypes && item.hazardTypes.length > 0) {
    parts.push(`Hazard types: ${item.hazardTypes.join(", ")}`);
  }

  if (item.trainingRequired) {
    parts.push("Training required before issue");
  }

  if (parts.length > 0) {
    return `${parts.join(". ")}.`;
  }

  if (item.safetyStandard?.trim()) {
    return `Meets ${item.safetyStandard.trim()}.`;
  }

  return "No description provided.";
}

const PPE_MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

/**
 * "2026-08-06T18:49:27.229Z" -> "8 july, 26".
 * Reads date parts from the string so timezone shifts can't move the day.
 */
function toIssueDateLabel(createdAt?: string): string {
  if (!createdAt?.trim()) return "—";

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(createdAt.trim());
  if (!match) return createdAt.slice(0, 10);

  const [, year, month, day] = match;
  const monthName = PPE_MONTHS[Number(month) - 1];
  if (!monthName) return createdAt.slice(0, 10);

  return `${String(Number(day))} ${monthName}, ${year.slice(2)}`;
}

function toIssueId(issue: PpeIssueDto, index: number): string {
  if (issue.id !== undefined && issue.id !== null && String(issue.id) !== "") {
    return String(issue.id);
  }

  return `issue-${String(index)}`;
}

function toEmployeeId(issue: PpeIssueDto): string {
  const candidates = [issue.assignedToId, issue.assignTo, issue.employeeId];

  for (const candidate of candidates) {
    if (
      candidate !== undefined &&
      candidate !== null &&
      String(candidate) !== ""
    ) {
      return String(candidate);
    }
  }

  return "";
}

function toIssueItemName(issue: PpeIssueDto): string {
  return (
    issue.itemName?.trim() ||
    issue.item?.trim() ||
    (issue.ppeId !== undefined ? `PPE ${String(issue.ppeId)}` : "PPE item")
  );
}

function toIssueCatalogId(issue: PpeIssueDto): string {
  if (issue.ppeId !== undefined && issue.ppeId !== null) {
    return String(issue.ppeId);
  }
  if (issue.ppeItemId !== undefined && issue.ppeItemId !== null) {
    return String(issue.ppeItemId);
  }
  return "";
}

function toProfileStatus(status?: string | null): PpeActiveItem["status"] {
  const raw = status?.trim().toLowerCase() ?? "";
  if (raw.includes("return")) return "Returned";
  if (raw.includes("overdue")) return "Overdue";
  return "Issued";
}

function toHistoryStatus(status?: string | null): PpeHistoryRecord["status"] {
  return toProfileStatus(status);
}

function toInitials(name: string): string {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function isActiveIssueStatus(status?: string | null): boolean {
  const raw = status?.trim().toLowerCase() ?? "";
  if (!raw) return true;
  return !raw.includes("return") && !raw.includes("closed");
}

function toActiveItemFromIssue(
  issue: PpeIssueDto,
  index: number,
): PpeActiveItem {
  const quantity = issue.quantity ?? 0;
  const size = issue.size?.trim() || "—";
  const issueDate = toIssueDateLabel(issue.createdAt);
  const note = issue.note?.trim();
  const summaryParts = [
    `Qty ${String(quantity)} × ${size}`,
    `Issued ${issueDate}`,
  ];
  if (note) summaryParts.push(note);

  return {
    id: toIssueId(issue, index),
    catalogId: toIssueCatalogId(issue),
    name: toIssueItemName(issue),
    summary: summaryParts.join(" · "),
    status: toProfileStatus(issue.status),
    canInspect: isActiveIssueStatus(issue.status),
  };
}

function toHistoryFromIssue(
  issue: PpeIssueDto,
  index: number,
): PpeHistoryRecord {
  return {
    id: toIssueId(issue, index),
    item: toIssueItemName(issue),
    quantity: issue.quantity ?? 0,
    issueDate: toIssueDateLabel(issue.createdAt),
    returnDate: issue.returnDate?.trim()
      ? toIssueDateLabel(issue.returnDate)
      : "—",
    condition: issue.condition?.trim() || "—",
    status: toHistoryStatus(issue.status),
  };
}

/** Map API `issues` into catalog issuance rows. */
function toPpeIssuanceRecords(
  issues: readonly PpeIssueDto[] | null | undefined,
): PpeIssuanceRecord[] {
  if (!issues?.length) return [];

  return issues.map((issue, index) => ({
    id: toIssueId(issue, index),
    employeeId: toEmployeeId(issue),
    employee: issue.assignedToName?.trim() || "—",
    quantity: issue.quantity ?? 0,
    size: issue.size?.trim() || "—",
    issueDate: toIssueDateLabel(issue.createdAt),
    status: issue.status?.trim() || "—",
    description:
      issue.note?.trim() ||
      [issue.assignedToRole?.trim(), issue.department?.trim()]
        .filter(Boolean)
        .join(" · ") ||
      undefined,
  }));
}

function toLogStatus(issue: PpeIssueDto): PpeLogStatus {
  const raw = issue.status?.trim().toLowerCase() ?? "";

  if (raw.includes("return") || issue.returnDate) return "Returned";
  if (raw.includes("overdue")) return "Overdue";
  if (raw.includes("due") || raw.includes("inspect")) return "Due Inspection";
  return "Issued";
}

function toIssueIdLabel(issue: PpeIssueDto, index: number): string {
  if (issue.id !== undefined && issue.id !== null && String(issue.id) !== "") {
    return `ISS-${String(issue.id)}`;
  }
  return `ISS-${String(index + 1)}`;
}

/** Map GET /api/ppe/issue/by-status rows into the issuance log table. */
export function toPpeIssuanceLogEntries(
  issues: readonly PpeIssueDto[] | null | undefined,
): PpeIssuanceLogEntry[] {
  if (!issues?.length) return [];

  return issues.map((issue, index) => {
    const status = toLogStatus(issue);
    const quantity = issue.quantity ?? 0;
    const size = issue.size?.trim() || "—";

    return {
      id: toIssueId(issue, index),
      issueId: toIssueIdLabel(issue, index),
      employee: issue.assignedToName?.trim() || "—",
      ppeItem: toIssueItemName(issue),
      qtySize: `${String(quantity)} × ${size}`,
      issueDate: toIssueDateLabel(issue.createdAt),
      returnDate: issue.returnDate?.trim()
        ? toIssueDateLabel(issue.returnDate)
        : "—",
      condition: issue.condition?.trim() || "—",
      status,
      canReturn: status !== "Returned",
    };
  });
}

function toIssueNumericId(issue: PpeIssueDto): number {
  if (typeof issue.id === "number" && Number.isFinite(issue.id))
    return issue.id;
  if (typeof issue.id === "string") {
    const parsed = Number(issue.id);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function toOptionalSiteId(value: number | string | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

/** Map GET /api/ppe/issue/assigned-to rows into acknowledgement table rows. */
export function toPpeAcknowledgementEntries(
  issues: readonly PpeIssueDto[] | null | undefined,
): PpeAcknowledgementEntry[] {
  if (!issues?.length) return [];

  return issues.map((issue, index) => {
    const name = issue.assignedToName?.trim() || "—";
    const quantity = issue.quantity ?? 0;

    return {
      id: toIssueId(issue, index),
      issueNumericId: toIssueNumericId(issue),
      assignToName: name,
      initials: toInitials(name === "—" ? "" : name),
      item: toIssueItemName(issue),
      quantity: String(quantity),
      size: issue.size?.trim() || "—",
      note: issue.note?.trim() || "—",
      acknowledged: Boolean(issue.employeeAck),
      siteId: toOptionalSiteId(issue.siteId),
    };
  });
}

/** Turn GET /api/ppe/issue/{id} into the catalog issuance detail modal model. */
export function toPpeIssuanceDetailFromIssue(
  issue: PpeIssueDto,
): PpeIssuanceDetail | null {
  if (issue.id === undefined || issue.id === null || String(issue.id) === "") {
    return null;
  }

  return {
    id: String(issue.id),
    employee: issue.assignedToName?.trim() || "—",
    role:
      issue.assignedToRole?.trim() ||
      issue.role?.trim() ||
      issue.jobTitle?.trim() ||
      "—",
    item: issue.item?.trim() || issue.itemName?.trim() || "—",
    quantity: issue.quantity ?? 0,
    size: issue.size?.trim() || "—",
    issueDate: toIssueDateLabel(issue.createdAt),
    status: issue.status?.trim() || "—",
    note: issue.note?.trim() || "",
    employeeAcknowledged: Boolean(issue.employeeAck),
  };
}

/** Turn GET /api/ppe/issue/{id} into the employee profile view model. */
export function toPpeEmployeeProfileFromIssue(
  detail: PpeIssueDetailDto,
): PpeEmployeeProfile | null {
  const name = detail.assignedToName?.trim() || "Unknown employee";
  const employeeId = toEmployeeId(detail);
  const related = detail.activeItems ?? detail.issues ?? detail.history ?? null;

  const relatedList =
    related && related.length > 0 ? related : ([detail] as PpeIssueDto[]);

  const activeItems = relatedList
    .filter((issue) => isActiveIssueStatus(issue.status))
    .map((issue, index) => toActiveItemFromIssue(issue, index));

  const historySource =
    detail.history && detail.history.length > 0 ? detail.history : relatedList;

  const history = historySource.map((issue, index) =>
    toHistoryFromIssue(issue, index),
  );

  const profileId =
    employeeId ||
    (detail.id !== undefined && detail.id !== null ? String(detail.id) : "");

  if (!profileId) return null;

  return {
    id: profileId,
    name,
    initials: toInitials(name),
    role:
      detail.assignedToRole?.trim() ||
      detail.role?.trim() ||
      detail.jobTitle?.trim() ||
      "—",
    department: detail.department?.trim() || "—",
    employeeCode:
      detail.employeeCode?.trim() || (employeeId ? `EMP-${employeeId}` : "—"),
    activeItems:
      activeItems.length > 0 ? activeItems : [toActiveItemFromIssue(detail, 0)],
    history: history.length > 0 ? history : [toHistoryFromIssue(detail, 0)],
  };
}

/** Turn GET /api/ppe/{id} into the catalog detail view model. */
export function toPpeCatalogDetail(item: PpeItemDto): PpeCatalogDetail | null {
  if (item.id === undefined) return null;

  const category = item.category?.trim() || "—";
  const issuances = toPpeIssuanceRecords(item.issues);

  return {
    id: String(item.id),
    name: toItemDisplayName(item),
    protectionType: category,
    standard: item.safetyStandard?.trim() || "—",
    supplier: item.supplier?.trim() || item.manufacturer?.trim() || "—",
    status: toCatalogStatus(item),
    description: toCatalogDescription(item),
    category,
    unitCost: toUnitCostLabel(item.unitCost),
    replaceAfter: item.replaceAfter?.trim() || "—",
    inspectionInterval: item.inspectionInterval?.trim() || "—",
    availableSizes: toAvailableSizesLabel(item.availableSize),
    inStock: item.inStock ?? 0,
    minLevel: item.minStock ?? 0,
    currentlyIssued: item.isUsed ?? issuances.length,
    onOrder: 0,
    issuances,
  };
}

/** Turn GET /api/ppe rows into inventory table rows. */
export function toPpeInventoryItems(
  items: readonly PpeItemDto[],
): PpeInventoryItem[] {
  return items.flatMap((item) => {
    if (item.id === undefined) return [];

    const onHand = item.inStock ?? 0;
    const currentlyIssued = item.isUsed ?? 0;
    const { stockLevel, stockCapacity } = toStockLevel(onHand, currentlyIssued);

    return [
      {
        id: String(item.id),
        itemName: toItemDisplayName(item),
        category: item.category?.trim() || "—",
        protectionType: item.category?.trim(),
        onHand,
        stockLevel,
        stockCapacity,
        currentlyIssued,
        reorderDate: item.replaceAfter?.trim() || "—",
        supplier: item.supplier?.trim() || item.manufacturer?.trim() || "—",
        attention: isLowStock(item),
        sites: [],
      },
    ];
  });
}

/** Read the issued record id from POST /api/ppe/issue. */
export function toIssueIdFromResponse(
  response: Readonly<{ dataModel?: { id?: number | string } | null }>,
): number | null {
  const id = response.dataModel?.id;
  if (typeof id === "number" && Number.isFinite(id)) return id;

  if (typeof id === "string") {
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toKpiCount(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return "0";
  return value.toLocaleString("en-US");
}

/** Turn GET /api/ppe/kpi into the metrics card row. */
export function toPpeMetricsFromKpi(
  kpi: PpeKpiDto | null | undefined,
): PpeMetric[] {
  // GET /api/ppe/kpi returns two counts and nothing else — no series, no
  // prior period — so both cards show an icon badge rather than a delta.
  return [
    {
      title: "Active assignments",
      value: toKpiCount(kpi?.activeAssignments),
      description: "PPE currently issued to workers",
      icon: "mdi:account-hard-hat-outline",
    },
    {
      title: "Items low stock",
      value: toKpiCount(kpi?.lowStockItems),
      description: "At or below the reorder point",
      isMorePositive: false,
      target: 0,
      signalOwnedBy: "target",
      icon: "mdi:package-variant-closed-remove",
    },
  ];
}
