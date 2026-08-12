import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import type { TableColumns } from "@/components/ui/table-columns";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import { formatNearMissDisplayId } from "@/lib/map-near-miss";
import { userNameFor } from "@/lib/map-user";
import type { NearMissRecord } from "@/app/dashboard/near-miss/near-miss-data";

const columnHelper = createColumnHelper<NearMissRecord>();

export type NearMissColumnHandlers = Readonly<{
  /** User id -> name, from /User/dropdown; ids stay raw until it loads. */
  userNames?: ReadonlyMap<string, string>;
  onView: (record: NearMissRecord) => void;
}>;

/**
 * Build the near-miss table columns. It's a factory (not a static array) so the
 * reporter cell can close over the page's user-name lookup.
 */
export function makeNearMissColumns(
  handlers: NearMissColumnHandlers,
): TableColumns<NearMissRecord> {
  const { userNames, onView } = handlers;

  return [
    columnHelper.accessor("id", {
      header: "ID",
      size: 90,
      cell: (info) => (
        <span className="text7 text-ehs-muted-text whitespace-nowrap">
          {formatNearMissDisplayId(info.getValue())}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("title", {
      header: "Near Miss",
      cell: ({ row }) => (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text4 text-ehs-dark-bg line-clamp-1 first-letter:uppercase">
            {`${row.original.title} · ${row.original.hazardType}`}
          </span>
          <span className="text4 text-ehs-muted-text line-clamp-1 first-letter:uppercase">
            {`Near miss · ${userNameFor(userNames, row.original.reporterId ?? "")}`}
          </span>
        </div>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("location", {
      header: "Site",
      size: 160,
      cell: (info) => (
        <span className="text4 text-ehs-gray">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: 130,
      cell: (info) => (
        <IncidentBadge
          label={info.getValue()}
          tone="muted"
          className="w-fit"
        />
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("age", {
      header: "Age",
      size: 120,
      cell: (info) => (
        <span className="text4 text-ehs-gray tabular-nums">{info.getValue()}</span>
      ),
      meta: { align: "right" as const },
    }),
    columnHelper.display({
      id: "view",
      header: "",
      size: 56,
      cell: ({ row }) => (
        <button
          type="button"
          className="text-ehs-muted-text hover:text-ehs-dark-bg inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
          aria-label={`View near miss ${formatNearMissDisplayId(row.original.id)}`}
          onClick={() => {
            onView(row.original);
          }}
        >
          <Icon icon="lets-icons:view" className="size-5" aria-hidden="true" />
        </button>
      ),
      meta: { align: "center" as const },
    }),
  ];
}
