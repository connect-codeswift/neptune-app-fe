import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { NearMissRecord } from "@/app/dashboard/near-miss/near-miss-data";

const columnHelper = createColumnHelper<NearMissRecord>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const nearMissColumns: ColumnDef<NearMissRecord, any>[] = [
  columnHelper.accessor("id", {
    header: "ID",
    size: 90,
    cell: (info) => (
      <span className="text-ehs-muted-text text-xs font-semibold tabular-nums">
        {info.getValue()}
      </span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("title", {
    header: "NEAR MISS",
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-ehs-dark-bg/62 font-normal">
          {row.original.title}
        </span>
        <span className="text-ehs-muted-text text-sm">
          {`Near miss · ${row.original.reporter}`}
        </span>
      </div>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("site", {
    header: "SITE",
    size: 160,
    cell: (info) => (
      <span className="text-ehs-gray font-normal">{info.getValue()}</span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("status", {
    header: "STATUS",
    size: 130,
    cell: (info) => <IncidentBadge label={info.getValue()} tone="muted" />,
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("age", {
    header: "AGE",
    size: 90,
    cell: (info) => (
      <span className="text-ehs-gray font-normal tabular-nums">
        {info.getValue()}
      </span>
    ),
    meta: { align: "right" as const },
  }),
];
