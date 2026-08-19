"use client";

import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import type { TableColumns } from "@/components/ui/table-columns";
import { Table } from "@/components/ui/Table";
import type {
  LotoHistoryRecord,
  LotoHistoryResult,
} from "@/app/dashboard/lockout-tagout/loto-data";
import { toast } from "@/lib/toast";

const columnHelper = createColumnHelper<LotoHistoryRecord>();

const resultClassName: Record<LotoHistoryResult, string> = {
  Completed: "bg-ehs-green/10 text-ehs-green",
  Active: "bg-ehs-red/10 text-ehs-red",
};

function buildColumns(): TableColumns<LotoHistoryRecord> {
  return [
    columnHelper.accessor("logId", {
      header: "Log ID",
      size: 120,
      cell: (info) => (
        <button
          type="button"
          className="text7 text-ehs-normal-blue cursor-pointer font-mono hover:underline"
          onClick={(event) => {
            event.stopPropagation();
            toast.info(`Open ${info.getValue()}`);
          }}
        >
          {info.getValue()}
        </button>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("operator", {
      header: "Operator",
      size: 120,
      cell: (info) => (
        <span className="text4 text-ehs-darker">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("lockNumber", {
      header: "Lock #",
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
        <span className="text4 text-ehs-gray line-clamp-1 max-w-45">
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

export type LotoEquipmentHistoryTabProps = Readonly<{
  history: readonly LotoHistoryRecord[];
}>;

/** History tab — Figma 6888:52576. */
export function LotoEquipmentHistoryTab(props: LotoEquipmentHistoryTabProps) {
  const { history } = props;
  const columns = useMemo(() => buildColumns(), []);

  return (
    <Table
      data={history}
      columns={columns}
      getRowId={(row) => String(row.id)}
      containerClassName="min-w-0"
      variant="incident"
      header={
        <p className="text3 text-ehs-darker py-1">
          Lockout History — {String(history.length)} records
        </p>
      }
    />
  );
}
