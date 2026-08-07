"use client";

import { useMemo } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Table } from "@/components/ui/Table";
import type { LotoHistoryRecord } from "@/app/dashboard/lockout-tagout/loto-data";
import { toast } from "@/lib/toast";

const columnHelper = createColumnHelper<LotoHistoryRecord>();

const resultClassName: Record<LotoHistoryRecord["result"], string> = {
  Completed: "bg-[rgba(16,185,129,0.1)] text-[#10b981]",
  Active: "bg-[rgba(239,68,68,0.1)] text-[#ef4444]",
};

function buildColumns(): ColumnDef<LotoHistoryRecord, unknown>[] {
  return [
    columnHelper.accessor("logId", {
      header: "LOG ID",
      size: 120,
      cell: (info) => (
        <button
          type="button"
          className="cursor-pointer font-mono text-base font-bold text-[#0891a6] hover:underline"
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
      header: "OPERATOR",
      size: 120,
      cell: (info) => (
        <span className="text-ehs-darker text-base font-medium">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("lockNumber", {
      header: "LOCK #",
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
        <span className="line-clamp-1 max-w-45 text-base text-[#2a3446]">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("duration", {
      header: "DURATION",
      size: 90,
      cell: (info) => (
        <span className="font-mono text-sm text-[#8892a3]">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("result", {
      header: "RESULT",
      size: 100,
      cell: (info) => {
        const result = info.getValue();
        return (
          <span
            className={[
              "inline-flex rounded-full px-2.5 py-0.5 text-sm font-semibold",
              resultClassName[result],
            ].join(" ")}
          >
            {result}
          </span>
        );
      },
      meta: { align: "left" as const },
    }),
  ] as ColumnDef<LotoHistoryRecord, unknown>[];
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
      getRowId={(row) => row.id}
      containerClassName="min-w-0"
      header={
        <p className="text-ehs-darker py-1 text-lg font-bold">
          Lockout History — {String(history.length)} records
        </p>
      }
    />
  );
}
