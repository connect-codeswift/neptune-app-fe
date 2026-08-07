import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type {
  LotoPersonnel,
  LotoPersonnelStatus,
} from "@/app/dashboard/lockout-tagout/loto-data";

const columnHelper = createColumnHelper<LotoPersonnel>();

const statusClassName: Record<LotoPersonnelStatus, string> = {
  Current: "bg-[rgba(16,185,129,0.1)] text-[#10b981]",
  Expired: "bg-[rgba(239,68,68,0.1)] text-[#ef4444]",
};

export type LotoPersonnelColumnActions = Readonly<{
  onEdit: (item: LotoPersonnel) => void;
  onRenew: (item: LotoPersonnel) => void;
}>;

export function buildLotoPersonnelColumns(
  actions: LotoPersonnelColumnActions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ColumnDef<LotoPersonnel, any>[] {
  return [
    columnHelper.accessor("name", {
      header: "NAME",
      size: 120,
      cell: (info) => {
        const item = info.row.original;
        return (
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-[rgba(8,145,166,0.12)] text-[11px] font-bold text-[#0891a6]">
              {item.initials}
            </span>
            <span className="text-ehs-darker text-base leading-5 font-semibold">
              {item.name}
            </span>
          </div>
        );
      },
      meta: { align: "left" as const },
    }),
    columnHelper.display({
      id: "role",
      header: "ROLE & DEPARTMENT",
      size: 120,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-base text-[#2a3446]">{row.original.role}</span>
          <span className="text-sm text-[#b3bbc8]">
            {row.original.department}
          </span>
        </div>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("certifiedOn", {
      header: "CERTIFIED",
      size: 120,
      cell: (info) => (
        <span className="text-base text-[#566072]">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("expiresOn", {
      header: "EXPIRES",
      size: 120,
      cell: (info) => {
        const expired = info.row.original.status === "Expired";
        return (
          <span
            className={[
              "text-base font-semibold",
              expired ? "text-[#ef4444]" : "text-[#2a3446]",
            ].join(" ")}
          >
            {info.getValue()}
          </span>
        );
      },
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("equipmentIds", {
      header: "EQUIPMENT",
      size: 120,
      cell: (info) => (
        <div className="flex max-w-70 flex-wrap gap-1">
          {info.getValue().map((equipmentId: string) => (
            <span
              key={equipmentId}
              className="rounded-md bg-[rgba(15,23,42,0.06)] px-2 py-0.5 text-sm font-medium text-[#566072]"
            >
              {equipmentId}
            </span>
          ))}
        </div>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("status", {
      header: "STATUS",
      size: 120,
      cell: (info) => (
        <span
          className={[
            "inline-flex rounded-full px-2.5 py-0.5 text-base font-semibold",
            statusClassName[info.getValue() as LotoPersonnelStatus],
          ].join(" ")}
        >
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.display({
      id: "actions",
      header: "actions",
      size: 120,
      cell: ({ row }) => {
        const item = row.original;
        const isExpired = item.status === "Expired";

        return (
          <div className="flex items-center gap-2">
            {isExpired ? (
              <button
                type="button"
                className="cursor-pointer text-base font-semibold text-[#ef4444] hover:underline"
                onClick={(event) => {
                  event.stopPropagation();
                  actions.onRenew(item);
                }}
              >
                Renew
              </button>
            ) : null}
            <button
              type="button"
              className="cursor-pointer text-base font-semibold text-[#566072] hover:underline"
              onClick={(event) => {
                event.stopPropagation();
                actions.onEdit(item);
              }}
            >
              Edit
            </button>
          </div>
        );
      },
      meta: { align: "left" as const },
    }),
  ];
}
