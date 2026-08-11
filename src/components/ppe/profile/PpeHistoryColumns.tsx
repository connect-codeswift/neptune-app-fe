import { createColumnHelper } from "@tanstack/react-table";
import type { TableColumns } from "@/components/ui/table-columns";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { PpeHistoryRecord } from "@/app/dashboard/ppe-management/ppe-data";

const columnHelper = createColumnHelper<PpeHistoryRecord>();

export const ppeHistoryColumns: TableColumns<PpeHistoryRecord> = [
  columnHelper.accessor("item", {
    header: "ITEM",
    size: 210,
    cell: (info) => (
      <span className="text-base font-medium text-[#2a3446]">
        {info.getValue()}
      </span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("quantity", {
    header: "QTY",
    size: 70,
    cell: (info) => (
      <span className="text-ehs-muted-text text-base tabular-nums">
        {String(info.getValue())}
      </span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("issueDate", {
    header: "DATE",
    size: 120,
    cell: (info) => (
      <span className="text-ehs-muted-text text-base">{info.getValue()}</span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("returnDate", {
    header: "RETURNED",
    size: 130,
    cell: (info) => (
      <span className="text-ehs-muted-text text-base">{info.getValue()}</span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("condition", {
    header: "CONDITION",
    size: 110,
    cell: (info) => (
      <span className="text-ehs-muted-text text-base">{info.getValue()}</span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("status", {
    header: "STATUS",
    size: 100,
    cell: (info) => (
      <IncidentBadge
        label={info.getValue()}
        tone="muted"
        className="w-fit rounded-full px-2.5 py-0.5 text-sm! font-semibold"
      />
    ),
    meta: { align: "left" as const },
  }),
];
