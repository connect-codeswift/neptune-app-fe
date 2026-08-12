import { createColumnHelper } from "@tanstack/react-table";
import type { TableColumns } from "@/components/ui/table-columns";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { BbsSession } from "@/app/dashboard/bbs/bbs-data";

const columnHelper = createColumnHelper<BbsSession>();

export const bbsSessionColumns: TableColumns<BbsSession> = [
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
    size: 140,
    cell: (info) => (
      <>
        <IncidentBadge
          label={info.getValue()}
          tone="muted"
          className="w-fit rounded-full px-2.5 py-0.5 text-base!"
        />
      </>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("observer", {
    header: "OBSERVER",
    size: 180,
    cell: (info) => (
      <span className="text-ehs-darker/60 text-base font-normal">
        {info.getValue()}
      </span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("location", {
    header: "LOCATION",
    size: 160,
    cell: (info) => (
      <span className="text-ehs-darker text-base font-normal">
        {info.getValue()}
      </span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("behaviors", {
    header: "CATEGORY",
    size: 160,
    cell: (info) => (
      <span className="text-ehs-gray text-base">{info.getValue()}</span>
    ),
    meta: { align: "left" as const },
  }),
];
