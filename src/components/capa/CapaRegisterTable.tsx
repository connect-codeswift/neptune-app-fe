"use client";

import { useMemo } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Table } from "@/components/ui/Table";
import type { CapaDashboardItem } from "@/components/capa/capa-dashboard-data";

const columnHelper = createColumnHelper<CapaDashboardItem>();

const STATUS_PILL: Record<CapaDashboardItem["status"], string> = {
  Planning: "bg-[rgba(8,145,166,0.12)] text-[#0891a6]",
  "In progress": "bg-[rgba(59,130,246,0.12)] text-[#3b82f6]",
  Overdue: "bg-[rgba(239,68,68,0.12)] text-[#ef4444]",
  Verified: "bg-[rgba(16,185,129,0.12)] text-[#10b981]",
};

const TYPE_PILL: Record<CapaDashboardItem["type"], string> = {
  Corrective: "bg-[#0891a6] text-white",
  Preventive: "bg-[rgba(15,23,42,0.06)] text-[#566072]",
};

function buildColumns(): ColumnDef<CapaDashboardItem, unknown>[] {
  return [
    columnHelper.accessor("code", {
      header: "ID",
      size: 140,
      cell: (info) => {
        const item = info.row.original;
        const typeLetter = item.type === "Corrective" ? "C" : "P";

        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-ehs-darker text-sm font-semibold">
              {info.getValue()}
            </span>
            <span
              className={[
                "inline-flex size-4.75 items-center justify-center rounded-md text-xs font-bold",
                TYPE_PILL[item.type],
              ].join(" ")}
              title={item.type}
            >
              {typeLetter}
            </span>
          </div>
        );
      },
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("title", {
      header: "Action",
      size: 260,
      cell: (info) => {
        const item = info.row.original;

        return (
          <div className="max-w-65">
            <p className="text-ehs-darker text-sm leading-snug font-medium">
              {info.getValue()}
            </p>
            <p className="text-ehs-muted-text mt-1 text-sm">{item.source}</p>
          </div>
        );
      },
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("owner", {
      header: "Owner",
      size: 100,
      cell: (info) => (
        <span className="text-ehs-slate text-sm">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("progress", {
      header: "Progress",
      size: 140,
      cell: (info) => {
        const item = info.row.original;
        const progress = info.getValue();

        return (
          <div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 min-w-16 flex-1 overflow-hidden rounded-full bg-[rgba(15,23,42,0.08)]">
                <div
                  className="h-full rounded-full bg-[#0891a6]"
                  style={{ width: `${String(progress)}%` }}
                />
              </div>
              <span className="text-ehs-muted-text text-xs tabular-nums">
                {`${String(progress)}%`}
              </span>
            </div>
            <span
              className={[
                "mt-1.5 inline-flex rounded-full px-2 py-0.5 text-sm font-semibold",
                STATUS_PILL[item.status],
              ].join(" ")}
            >
              {item.status}
            </span>
          </div>
        );
      },
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("dueDate", {
      header: "Due",
      size: 100,
      cell: (info) => {
        const item = info.row.original;

        return (
          <div>
            <p className="text-ehs-darker text-sm tabular-nums">
              {info.getValue()}
            </p>
            <p
              className={[
                "mt-1 text-xs",
                item.status === "Overdue"
                  ? "font-semibold text-[#ef4444]"
                  : "text-ehs-muted-text",
              ].join(" ")}
            >
              {item.dueLabel}
            </p>
          </div>
        );
      },
      meta: { align: "right" as const },
    }),
  ] as ColumnDef<CapaDashboardItem, unknown>[];
}

export type CapaRegisterTableProps = Readonly<{
  items: readonly CapaDashboardItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}>;

/** CAPA register table — Figma 7123:42324. */
export function CapaRegisterTable(props: CapaRegisterTableProps) {
  const { items, selectedId, onSelect } = props;
  const columns = useMemo(() => buildColumns(), []);

  return (
    <Table
      data={items}
      columns={columns}
      getRowId={(row) => row.id}
      selectedRowId={selectedId}
      onRowClick={(row) => onSelect(row.id)}
      containerClassName="min-w-0"
    />
  );
}
