"use client";

import { useMemo } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Table } from "@/components/ui/Table";
import type { CapaDashboardItem } from "@/components/capa/capa-dashboard-data";
import {
  CAPA_BADGE_TONE_CLASS,
  getPriorityTone,
} from "@/components/capa/capa-list-data";
import { capaStatusPillClass } from "@/lib/capa-filters";

const columnHelper = createColumnHelper<CapaDashboardItem>();

const TYPE_PILL: Record<CapaDashboardItem["type"], string> = {
  Corrective: "bg-[rgba(245,158,11,0.16)] text-[#f59e0b]",
  Preventive: "bg-[rgba(59,130,246,0.14)] text-[#3b82f6]",
};

function clipWords(value: string, maxWords = 4): string {
  const trimmed = value.trim();
  if (!trimmed) return "—";

  const words = trimmed.split(/\s+/);
  if (words.length <= maxWords) {
    return trimmed;
  }

  return `${words.slice(0, maxWords).join(" ")}…`;
}

function buildColumns(): ColumnDef<CapaDashboardItem, unknown>[] {
  return [
    columnHelper.accessor("code", {
      header: "ID",
      size: 150,
      cell: (info) => {
        const item = info.row.original;
        const typeLetter = item.type === "Corrective" ? "C" : "P";
        const code = info.getValue();

        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span
              className="text-ehs-darker text-sm font-semibold"
              title={code}
            >
              {code}
            </span>
            <span
              className={[
                "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-sm leading-5 font-bold tracking-wide",
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
    columnHelper.accessor("control", {
      header: "Control",
      size: 200,
      cell: (info) => {
        const control = info.getValue();

        return (
          <span
            className="text-ehs-darker block max-w-[200px] truncate text-sm whitespace-nowrap"
            title={control}
          >
            {clipWords(control)}
          </span>
        );
      },
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("priority", {
      header: "Priority",
      size: 110,
      cell: (info) => {
        const priority = info.getValue();
        const label =
          priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();

        return (
          <span
            className={[
              "inline-flex rounded-full px-2 py-0.5 text-sm font-semibold whitespace-nowrap capitalize",
              CAPA_BADGE_TONE_CLASS[getPriorityTone(priority)],
            ].join(" ")}
            title={label}
          >
            {label}
          </span>
        );
      },
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("progress", {
      header: "Progress",
      size: 200,
      cell: (info) => {
        const item = info.row.original;
        const progress = info.getValue();

        return (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-[rgba(15,23,42,0.08)]">
              <div
                className="h-full rounded-full bg-[#0891a6]"
                style={{ width: `${String(progress)}%` }}
              />
            </div>
            <span className="text-ehs-muted-text text-sm tabular-nums">
              {`${String(progress)}%`}
            </span>
            <span
              className={[
                "inline-flex rounded-full px-2 py-0.5 text-sm font-semibold",
                capaStatusPillClass(item.status),
              ].join(" ")}
              title={item.status}
            >
              {item.status}
            </span>
          </div>
        );
      },
      meta: { align: "left" as const },
    }),
  ] as ColumnDef<CapaDashboardItem, unknown>[];
}

export type CapaRegisterTableProps = Readonly<{
  items: readonly CapaDashboardItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (pageNumber: number) => void;
  isPaginationLoading?: boolean;
}>;

/** CAPA register table — Figma 7123:42324. */
export function CapaRegisterTable(props: CapaRegisterTableProps) {
  const {
    items,
    selectedId,
    onSelect,
    pageNumber,
    pageSize,
    totalCount,
    onPageChange,
    isPaginationLoading = false,
  } = props;
  const columns = useMemo(() => buildColumns(), []);

  const pagination = {
    pageNumber,
    pageSize,
    totalRecords: totalCount,
    onPageChange,
    isLoading: isPaginationLoading,
  };

  return (
    <Table
      data={items}
      columns={columns}
      getRowId={(row) => row.id}
      selectedRowId={selectedId}
      onRowClick={(row) => onSelect(row.id)}
      containerClassName="min-w-0"
      pagination={pagination}
    />
  );
}
