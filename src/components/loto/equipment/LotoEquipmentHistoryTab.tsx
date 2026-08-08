"use client";

import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import type { TableColumns } from "@/components/ui/table-columns";
import { Table } from "@/components/ui/Table";
import type { LotoHistoryRecord } from "@/app/dashboard/lockout-tagout/loto-data";
import { toast } from "@/lib/toast";

const columnHelper = createColumnHelper<LotoHistoryRecord>();

const resultClassName: Record<LotoHistoryRecord["result"], string> = {
  Completed: "bg-[rgba(16,185,129,0.1)] text-[#10b981]",
  Active: "bg-[rgba(239,68,68,0.1)] text-[#ef4444]",
};

function buildColumns(): TableColumns<LotoHistoryRecord> {
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
        <span className="text-ehs-darker text-[12.5px] font-medium">
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
      size: 180,
      cell: (info) => (
        <span className="line-clamp-1 max-w-45 text-[12.5px] text-[#2a3446]">
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
      cell: (info) => {
        const result = info.getValue() as LotoHistoryRecord["result"];
        return (
        <span
          className={[
            "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
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
      getRowId={(row) => row.id}
      containerClassName="min-w-0"
      header={
        <p className="text-ehs-darker py-1 text-sm font-bold">
          Lockout History — {String(history.length)} records
        </p>
      }
    />
  );
}
