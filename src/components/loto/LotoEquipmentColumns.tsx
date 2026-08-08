import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
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
  onEdit: (item: LotoEquipmentItem) => void;
  onLock: (item: LotoEquipmentItem) => void;
}>;

export function buildLotoEquipmentColumns(
  actions: LotoEquipmentColumnActions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ColumnDef<LotoEquipmentItem, any>[] {
  return [
    columnHelper.accessor("name", {
      header: "EQUIPMENT",
      size: 200,
      cell: (info) => (
        <span className="text-ehs-darker text-base leading-5 font-semibold">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("type", {
      header: "TYPE",
      size: 120,
      cell: (info) => (
        <span className="text-ehs-darker text-base">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("location", {
      header: "LOCATION",
      size: 120,
      cell: (info) => (
        <span className="text-ehs-darker text-base">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("energySources", {
      header: "ENERGY SOURCES",
      size: 220,
      cell: (info) => {
        const sources = info.getValue() as LotoEquipmentItem["energySources"];
        return (
          <div className="flex max-w-55 flex-wrap gap-1">
            {info.getValue().map((source: string) => (
              <span
                key={source}
                className="rounded-md bg-[rgba(15,23,42,0.06)] px-2 py-0.5 text-sm text-[#566072]"
              >
                {source}
              </span>
            ))}
          </div>
        );
      },
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("procedureId", {
      header: "PROCEDURE",
      size: 110,
      cell: (info) => (
        <span className="font-mono text-sm font-bold text-[#566072]">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("status", {
      header: "STATUS",
      size: 110,
      cell: (info) => {
        const status = info.getValue() as LotoEquipmentStatus;
        return (
          <span
            className={[
              "inline-flex rounded-full px-2.5 py-0.5 text-sm font-semibold",
              statusClassName[info.getValue() as LotoEquipmentStatus],
            ].join(" ")}
          >
            {status}
          </span>
        );
      },
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("lastInspection", {
      header: "LAST INSPECTION",
      size: 120,
      cell: (info) => (
        <span className="text-sm text-[#8892a3]">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      size: 100,
      cell: ({ row }) => {
        const item = row.original;
        const canLock = item.status !== "Locked Out";

        return (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="cursor-pointer text-sm font-semibold text-[#566072] hover:underline"
              onClick={(event) => {
                event.stopPropagation();
                actions.onView(item);
              }}
            >
              View
            </button>
            <button
              type="button"
              className="cursor-pointer text-sm font-semibold text-[#566072] hover:underline"
              onClick={(event) => {
                event.stopPropagation();
                actions.onEdit(item);
              }}
            >
              Edit
            </button>
            {canLock ? (
              <button
                type="button"
                className="cursor-pointer text-sm font-semibold text-[#ef4444] hover:underline"
                onClick={(event) => {
                  event.stopPropagation();
                  actions.onLock(item);
                }}
              >
                Lock
              </button>
            ) : null}
          </div>
        );
      },
      meta: { align: "left" as const },
    }),
  ];
}
