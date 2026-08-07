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
      size: 120,
      cell: (info) => (
        <button
          type="button"
          className="cursor-pointer font-mono text-base font-bold text-[#0891a6] hover:underline"
          // onClick={(event) => {
          //   event.stopPropagation();
          //   actions.onLogClick(info.row.original);
          // }}
        >
          {info.getValue()}
        </button>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("equipment", {
      header: "EQUIPMENT",
      size: 120,
      cell: (info) => (
        <span className="text-ehs-darker line-clamp-1 text-base font-medium">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("operator", {
      header: "OPERATOR",
      size: 120,
      cell: (info) => (
        <span className="text-base font-medium text-[#2a3446]">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("lockNumber", {
      header: "LOCK",
      size: 120,
      cell: (info) => (
        <span className="font-mono text-base text-[#566072]">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("startAt", {
      header: "START",
      size: 120,
      cell: (info) => (
        <span className="text-base whitespace-nowrap text-[#566072]">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("endAt", {
      header: "END",
      size: 120,
      cell: (info) => (
        <span className="text-base whitespace-nowrap text-[#8892a3]">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("purpose", {
      header: "PURPOSE",
      size: 120,
      cell: (info) => (
        <span className="line-clamp-1 max-w-40 text-base text-[#2a3446]">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("duration", {
      header: "DURATION",
      size: 90,
      cell: (info) => (
        <span className="font-mono text-base text-[#8892a3]">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("result", {
      header: "RESULT",
      size: 100,
      cell: (info) => {
        const result = info.getValue() as LotoHistoryResult;
        return (
          <span
            className={[
              "inline-flex rounded-full px-2.5 py-0.5 text-base font-semibold",
              resultClassName[info.getValue() as LotoHistoryResult],
            ].join(" ")}
          >
            {result}
          </span>
        );
      },
      meta: { align: "left" as const },
    }),
  ];
}
