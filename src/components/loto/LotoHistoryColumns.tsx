import { createColumnHelper } from "@tanstack/react-table";
import type { TableColumns } from "@/components/ui/table-columns";
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
  _actions: LotoHistoryColumnActions,
): TableColumns<LotoHistoryRecord> {
  return [
    columnHelper.accessor("logId", {
      header: "Log ID",
      size: 120,
      cell: (info) => (
        <button
          type="button"
          className="text7 text-ehs-normal-blue cursor-pointer font-mono hover:underline"
        >
          {info.getValue()}
        </button>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("equipment", {
      header: "Equipment",
      size: 120,
      cell: (info) => (
        <span className="text4 text-ehs-darker line-clamp-1">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("operator", {
      header: "Operator",
      size: 120,
      cell: (info) => (
        <span className="text4 text-ehs-gray">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("lockNumber", {
      header: "Lock",
      size: 120,
      cell: (info) => (
        <span className="text7 text-ehs-gray font-mono">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("startAt", {
      header: "Start",
      size: 120,
      cell: (info) => (
        <span className="text4 text-ehs-gray whitespace-nowrap">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("endAt", {
      header: "End",
      size: 120,
      cell: (info) => (
        <span className="text4 text-ehs-muted-text whitespace-nowrap">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("purpose", {
      header: "Purpose",
      size: 120,
      cell: (info) => (
        <span className="text4 text-ehs-gray line-clamp-1 max-w-40">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("duration", {
      header: "Duration",
      size: 90,
      cell: (info) => (
        <span className="text7 text-ehs-muted-text font-mono">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("result", {
      header: "Result",
      size: 100,
      cell: (info) => {
        const result = info.getValue() as LotoHistoryResult;
        return (
          <span
            className={[
              "text5 inline-flex rounded-full px-2.5 py-0.5",
              resultClassName[result],
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
