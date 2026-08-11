import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import type { TableColumns } from "@/components/ui/table-columns";
import type {
  LotoEquipmentItem,
  LotoEquipmentStatus,
} from "@/app/dashboard/lockout-tagout/loto-data";

const columnHelper = createColumnHelper<LotoEquipmentItem>();

const statusClassName: Record<LotoEquipmentStatus, string> = {
  Operational: "bg-[rgba(16,185,129,0.12)] text-[#10b981]",
  "Locked Out": "bg-[rgba(239,68,68,0.12)] text-[#ef4444]",
  Maintenance: "bg-[rgba(245,158,11,0.12)] text-[#f59e0b]",
};

export type LotoEquipmentColumnActions = Readonly<{
  onView: (item: LotoEquipmentItem) => void;
  onLock: (item: LotoEquipmentItem) => void;
}>;

export function buildLotoEquipmentColumns(
  actions: LotoEquipmentColumnActions,
): TableColumns<LotoEquipmentItem> {
  return [
    columnHelper.accessor("name", {
      header: "Equipment",
      size: 180,
      cell: (info) => (
        <span className="text4 text-ehs-darker">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("type", {
      header: "Type",
      size: 120,
      cell: (info) => (
        <span className="text4 text-ehs-gray">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("location", {
      header: "Location",
      size: 120,
      cell: (info) => (
        <span className="text4 text-ehs-gray">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("energySources", {
      header: "Energy Sources",
      size: 220,
      cell: (info) => (
        <div className="flex max-w-55 flex-wrap gap-1">
          {info.getValue().map((source: string) => (
            <span
              key={source}
              className="text8 rounded-md bg-[rgba(15,23,42,0.06)] px-2 py-0.5 text-[#566072]"
            >
              {source}
            </span>
          ))}
        </div>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("procedureId", {
      header: "Procedure",
      size: 110,
      cell: (info) => (
        <span className="text7 text-ehs-muted-text font-mono">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: 110,
      cell: (info) => {
        const status = info.getValue() as LotoEquipmentStatus;
        return (
          <span
            className={[
              "text5 inline-flex rounded-full px-2.5 py-0.5",
              statusClassName[status],
            ].join(" ")}
          >
            {status}
          </span>
        );
      },
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("lastInspection", {
      header: "Last Inspection",
      size: 120,
      cell: (info) => (
        <span className="text4 text-ehs-muted-text">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      size: 88,
      cell: ({ row }) => {
        const item = row.original;
        const isLockedOut = item.status === "Locked Out";

        return (
          <div className="flex items-center justify-center gap-0.5">
            <button
              type="button"
              className="text-ehs-muted-text hover:text-ehs-dark-bg inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
              aria-label={`View ${item.name}`}
              onClick={(event) => {
                event.stopPropagation();
                actions.onView(item);
              }}
            >
              <Icon
                icon="lets-icons:view"
                className="size-5"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              disabled={isLockedOut}
              className={[
                "inline-flex size-8 items-center justify-center rounded-lg transition-colors",
                isLockedOut
                  ? "cursor-default text-[#ef4444]"
                  : "text-ehs-muted-text hover:text-ehs-dark-bg cursor-pointer",
              ].join(" ")}
              aria-label={
                isLockedOut
                  ? `${item.name} is locked out`
                  : `Apply lockout to ${item.name}`
              }
              onClick={(event) => {
                event.stopPropagation();
                if (!isLockedOut) {
                  actions.onLock(item);
                }
              }}
            >
              <Icon
                icon="material-symbols:lock-outline"
                className="size-5"
                aria-hidden="true"
              />
            </button>
          </div>
        );
      },
      meta: { align: "center" as const },
    }),
  ];
}
