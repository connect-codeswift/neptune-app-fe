import { createColumnHelper } from "@tanstack/react-table";
import type { TableColumns } from "@/components/ui/table-columns";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { PpeHistoryRecord } from "@/app/dashboard/ppe-management/ppe-data";

const columnHelper = createColumnHelper<PpeHistoryRecord>();

export const ppeHistoryColumns: TableColumns<PpeHistoryRecord> = [
  columnHelper.accessor("item", {
    header: "Item",
    size: 210,
    cell: (info) => (
      <span className="text4 text-ehs-darker">{info.getValue()}</span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("quantity", {
    header: "Qty",
    size: 70,
    cell: (info) => (
      <span className="text4 text-ehs-muted-text tabular-nums">
        {String(info.getValue())}
      </span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("issueDate", {
    header: "Date",
    size: 120,
    cell: (info) => (
      <span className="text4 text-ehs-muted-text">{info.getValue()}</span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("returnDate", {
    header: "Returned",
    size: 130,
    cell: (info) => (
      <span className="text4 text-ehs-muted-text">{info.getValue()}</span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("condition", {
    header: "Condition",
    size: 110,
    cell: (info) => (
      <span className="text4 text-ehs-muted-text">{info.getValue()}</span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    size: 100,
    cell: (info) => (
      <IncidentBadge label={info.getValue()} tone="muted" className="w-fit" />
    ),
    meta: { align: "left" as const },
  }),
];
