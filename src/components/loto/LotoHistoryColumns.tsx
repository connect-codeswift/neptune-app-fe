import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type {
  LotoHistoryRecord,
  LotoHistoryResult,
} from "@/app/dashboard/lockout-tagout/loto-data";

const columnHelper = createColumnHelper<LotoHistoryRecord>();

const resultClassName: Record<LotoHistoryResult, string> = {
  Completed: "bg-[rgba(16,185,129,0.1)] text-[#10b981]",
  Active: "bg-[rgba(239,68,68,0.1)] text-[#ef4444]",
};

export type LotoHistoryColumnActions = Readonly<{
  onLogClick: (item: LotoHistoryRecord) => void;
}>;

export function buildLotoHistoryColumns(
  actions: LotoHistoryColumnActions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ColumnDef<LotoHistoryRecord, any>[] {
  return [
    columnHelper.accessor("logId", {
      header: "LOG ID",
      size: 110,
      cell: (info) => (
        <button
          type="button"
          className="cursor-pointer font-mono text-xs font-bold text-[#0891a6] hover:underline"
          onClick={(event) => {
            event.stopPropagation();
            actions.onLogClick(info.row.original);
          }}
        >
          {info.getValue()}
        </button>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("equipment", {
      header: "EQUIPMENT",
      size: 160,
      cell: (info) => (
        <span className="text-ehs-darker line-clamp-1 text-[12.5px] font-medium">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("operator", {
      header: "OPERATOR",
      size: 120,
      cell: (info) => (
        <span className="text-[12.5px] font-medium text-[#2a3446]">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("lockNumber", {
      header: "LOCK #",
      size: 80,
      cell: (info) => (
        <span className="font-mono text-xs text-[#566072]">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("startAt", {
      header: "START",
      size: 130,
      cell: (info) => (
        <span className="text-xs whitespace-nowrap text-[#566072]">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("endAt", {
      header: "END",
      size: 130,
      cell: (info) => (
        <span className="text-xs whitespace-nowrap text-[#8892a3]">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("purpose", {
      header: "PURPOSE",
      size: 160,
      cell: (info) => (
        <span className="line-clamp-1 max-w-40 text-[12.5px] text-[#2a3446]">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("duration", {
      header: "DURATION",
      size: 90,
      cell: (info) => (
        <span className="font-mono text-xs text-[#8892a3]">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("result", {
      header: "RESULT",
      size: 100,
      cell: (info) => (
        <span
          className={[
            "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
            resultClassName[info.getValue()],
          ].join(" ")}
        >
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
  ];
}
