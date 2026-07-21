import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import { formatNearMissDisplayId } from "@/lib/map-near-miss";
import type { NearMissRecord } from "@/app/dashboard/near-miss/near-miss-data";

const columnHelper = createColumnHelper<NearMissRecord>();

export type NearMissColumnHandlers = Readonly<{
  onDelete: (record: NearMissRecord) => void;
  deletingId?: string | null;
}>;

/**
 * Build the near-miss table columns. It's a factory (not a static array) so the
 * Actions column can close over the page's delete handler.
 */
export function makeNearMissColumns(
  handlers: NearMissColumnHandlers,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ColumnDef<NearMissRecord, any>[] {
  const { onDelete, deletingId } = handlers;

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
          {/* Static placeholder: the backend sends a userId, not a reporter name. */}
          <span className="text-ehs-muted-text text-sm">
            Near miss · Dana Kim
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
      cell: (info) => <IncidentBadge label={info.getValue()} tone="muted" />,
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("dateOfEvent", {
      header: "DATE",
      size: 120,
      cell: (info) => (
        <span className="text-ehs-gray font-normal tabular-nums">
          {info.getValue()}
        </span>
      ),
      meta: { align: "right" as const },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      size: 60,
      cell: ({ row }) => {
        const isDeleting = deletingId === row.original.id;

        return (
          <button
            type="button"
            aria-label={`Delete ${formatNearMissDisplayId(row.original.id)}`}
            disabled={isDeleting}
            onClick={(event) => {
              // Don't let the click bubble to the row's navigation handler.
              event.stopPropagation();
              onDelete(row.original);
            }}
            className="text-ehs-muted-text hover:bg-ehs-red/10 hover:text-ehs-red inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon
              icon={isDeleting ? "mdi:loading" : "mdi:trash-can-outline"}
              className={["text-lg", isDeleting ? "animate-spin" : ""]
                .filter(Boolean)
                .join(" ")}
              aria-hidden="true"
            />
          </button>
        );
      },
      meta: { align: "right" as const },
    }),
  ];
}
