import type { PpeIssuanceLogEntry } from "@/app/dashboard/ppe-management/ppe-data";

const CSV_HEADER = [
  "Issue ID",
  "Employee",
  "PPE Item",
  "Qty / Size",
  "Issue Date",
  "Return Date",
  "Condition",
  "Status",
] as const;

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function buildIssuanceLogCsv(entries: readonly PpeIssuanceLogEntry[]): string {
  const rows = entries.map((entry) =>
    [
      entry.issueId,
      entry.employee,
      entry.ppeItem,
      entry.qtySize,
      entry.issueDate,
      entry.returnDate,
      entry.condition,
      entry.status,
    ]
      .map(csvCell)
      .join(","),
  );

  return [CSV_HEADER.map(csvCell).join(","), ...rows].join("\r\n");
}

/** Triggers a client-side CSV download of the issuance log. Browser-only. */
export function exportIssuanceLogToCsv(
  entries: readonly PpeIssuanceLogEntry[],
): void {
  const csv = buildIssuanceLogCsv(entries);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ppe-issuance-log.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
