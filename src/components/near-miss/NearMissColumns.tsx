import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import { formatNearMissDisplayId } from "@/lib/map-near-miss";
import { userNameFor } from "@/lib/map-user";
import type { NearMissRecord } from "@/app/dashboard/near-miss/near-miss-data";

const columnHelper = createColumnHelper<NearMissRecord>();

export type NearMissColumnHandlers = Readonly<{
  /** User id -> name, from /User/dropdown; ids stay raw until it loads. */
  userNames?: ReadonlyMap<string, string>;
}>;

/**
 * Build the near-miss table columns. It's a factory (not a static array) so the
 * reporter cell can close over the page's user-name lookup.
 */
export function makeNearMissColumns(
  handlers: NearMissColumnHandlers,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ColumnDef<NearMissRecord, any>[] {
  const { userNames } = handlers;

  return [
    columnHelper.accessor("id", {
      header: "ID",
      size: 90,
      cell: (info) => (
        <span className="text-ehs-muted-text text-xs font-semibold tabular-nums">
          {formatNearMissDisplayId(info.getValue())}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("title", {
      header: "NEAR MISS",
      cell: ({ row }) => (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-ehs-dark-bg font-normal">
            {`${row.original.title} · ${row.original.hazardType}`}
          </span>
          <span className="text-ehs-muted-text text-sm">
            {`Near miss · ${userNameFor(userNames, row.original.reporterId ?? "")}`}
          </span>
        </div>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("location", {
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
      size: 120,
      cell: (info) => (
        <span className="text-ehs-gray font-normal tabular-nums">
          {info.getValue()}
        </span>
      ),
      meta: { align: "right" as const },
    }),
  ];
}
