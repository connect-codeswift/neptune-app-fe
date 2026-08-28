import type { HazcomChemical } from "@/components/hazcom/shared";
import { formatRecordDisplayId } from "@/lib/format-record-id";

/** Case-insensitive match against every field the inventory table shows. */
export function chemicalMatchesSearch(
  chemical: HazcomChemical,
  query: string,
): boolean {
  const trimmed = query.trim().toLowerCase();
  if (trimmed === "") {
    return true;
  }

  // Every column the table shows, plus the SDS file name — searching for a
  // hazard class or a signal word that is visibly on screen and getting no
  // rows back reads as a broken search.
  const haystack = [
    formatRecordDisplayId("CHEM", chemical.id),
    chemical.name,
    chemical.casNumber,
    chemical.location,
    chemical.disposeLocation ?? "",
    chemical.quantity,
    chemical.hazardClass,
    chemical.signalWord,
    chemical.status,
    chemical.sdsRecordId ?? "",
    chemical.sdsFileName ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(trimmed);
}

export const CHEMICAL_STATUS_FILTER_OPTIONS = [
  "All",
  "Active",
  "Inactive",
] as const;

export type ChemicalStatusFilter =
  (typeof CHEMICAL_STATUS_FILTER_OPTIONS)[number];

export function chemicalMatchesStatus(
  chemical: HazcomChemical,
  status: ChemicalStatusFilter,
): boolean {
  return status === "All" || chemical.status === status;
}

/** Splits a combined quantity string ("15 Liters") into amount + unit parts. */
export function splitQuantity(
  quantity: string,
): Readonly<{ amount: string; unit: string }> {
  const match = /^(\d+(?:\.\d+)?)\s*(.*)$/.exec(quantity.trim());
  if (!match) {
    return { amount: quantity.trim(), unit: "" };
  }

  return { amount: match[1] ?? "", unit: (match[2] ?? "").trim() };
}

/** Colored text class for a GHS signal word — no shared tone helper covers this. */
export function signalWordTextClass(signalWord: string): string {
  return signalWord === "Danger" ? "text-ehs-red" : "text-ehs-yellow";
}

/** Inventory status as plain colored text, matching the signal-word column. */
export function chemicalStatusTextClass(status: string): string {
  return status === "Active" ? "text-ehs-green" : "text-ehs-muted-text";
}

const CSV_HEADER = [
  "ID",
  "Chemical Name",
  "CAS #",
  "Location",
  "Quantity",
  "Hazard Class",
  "Signal Word",
  "Status",
] as const;

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function buildChemicalsCsv(chemicals: readonly HazcomChemical[]): string {
  const rows = chemicals.map((chemical) =>
    [
      formatRecordDisplayId("CHEM", chemical.id),
      chemical.name,
      chemical.casNumber,
      chemical.location,
      chemical.quantity,
      chemical.hazardClass,
      chemical.signalWord,
      chemical.status,
    ]
      .map(csvCell)
      .join(","),
  );

  return [CSV_HEADER.map(csvCell).join(","), ...rows].join("\r\n");
}

/** Triggers a client-side CSV download of the given chemicals. Browser-only. */
export function exportChemicalsToCsv(
  chemicals: readonly HazcomChemical[],
): void {
  const csv = buildChemicalsCsv(chemicals);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "hazcom-chemical-inventory.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
