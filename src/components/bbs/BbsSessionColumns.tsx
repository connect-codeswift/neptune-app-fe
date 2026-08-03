import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { BbsSession } from "@/app/dashboard/bbs/bbs-data";

const columnHelper = createColumnHelper<BbsSession>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const bbsSessionColumns: ColumnDef<BbsSession, any>[] = [
  columnHelper.accessor("id", {
    header: "ID",
    size: 110,
    cell: (info) => (
      <span className="text-ehs-darker/80 text-base font-normal">
        {info.getValue()}
      </span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("type", {
    header: "TYPE",
    size: 170,
    cell: (info) => (
      <IncidentBadge
        label={info.getValue()}
        tone="muted"
        className="w-fit rounded-full px-2.5 py-0.5 text-sm!"
      />
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("observer", {
    header: "OBSERVER",
    size: 160,
    cell: (info) => (
      <span className="text-ehs-darker/60 text-base font-normal">
        {info.getValue()}
      </span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("location", {
    header: "LOCATION",
    size: 180,
    cell: (info) => (
      <span className="text-ehs-darker text-base font-normal">
        {info.getValue()}
      </span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("behaviors", {
    header: "BEHAVIORS",
    size: 140,
    cell: (info) => (
      <span className="text-ehs-gray text-base">{info.getValue()}</span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("safePercent", {
    header: "SAFE %",
    size: 100,
    cell: (info) => (
      <IncidentBadge
        label={`${String(info.getValue())}%`}
        tone="muted"
        showDot
        className="w-fit rounded-full px-2.5 py-0.5 text-sm!"
      />
    ),
    meta: { align: "right" as const },
  }),
];
