import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { WalkTalkSession } from "@/app/dashboard/walk-talk/walk-talk-data";

const columnHelper = createColumnHelper<WalkTalkSession>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const walkTalkSessionColumns: ColumnDef<WalkTalkSession, any>[] = [
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
    size: 160,
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
    size: 150,
    cell: (info) => (
      <span className="text-ehs-darker/60 text-base font-normal">
        {info.getValue()}
      </span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("focusArea", {
    header: "FOCUS AREA",
    size: 200,
    cell: (info) => {
      const session = info.row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-ehs-darker text-base font-normal">
            {info.getValue()}
          </span>
          <span className="text-ehs-muted-text text-sm">{session.when}</span>
        </div>
      );
    },
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("site", {
    header: "SITE",
    size: 160,
    cell: (info) => (
      <span className="text-ehs-gray text-base font-normal">
        {info.getValue()}
      </span>
    ),
    meta: { align: "left" as const },
  }),
];
