import { createColumnHelper } from "@tanstack/react-table";
import type { TableColumns } from "@/components/ui/table-columns";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import { userNameFor } from "@/lib/map-user";
import type { HazardRecord } from "@/app/dashboard/hazard/hazard-data";

const columnHelper = createColumnHelper<HazardRecord>();

export type HazardColumnHandlers = Readonly<{
  userNames?: ReadonlyMap<string, string>;
}>;

export function makeHazardColumns(
  handlers: HazardColumnHandlers,
): TableColumns<HazardRecord> {
  const { userNames } = handlers;

  return [
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
      header: "HAZARD",
      cell: ({ row }) => (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-ehs-dark-bg font-normal capitalize">
            {`${row.original.title} · ${row.original.hazardType}`}
          </span>
          <span className="text-ehs-muted-text text-sm">
            {`Hazard · ${userNameFor(userNames, row.original.reporterId ?? "")}`}
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
      cell: (info) => (
        <IncidentBadge
          label={info.getValue()}
          tone="muted"
          className="w-fit rounded-full px-2 py-0.5 text-sm! tracking-[0.11px]"
        />
      ),
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
}
