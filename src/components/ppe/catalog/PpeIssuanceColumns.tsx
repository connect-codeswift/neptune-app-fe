"use client";

import { createColumnHelper } from "@tanstack/react-table";
import type { TableColumns } from "@/components/ui/table-columns";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { PpeIssuanceRecord } from "@/app/dashboard/ppe-management/ppe-data";

const columnHelper = createColumnHelper<PpeIssuanceRecord>();

export const ppeIssuanceColumns: TableColumns<PpeIssuanceRecord> = [
  columnHelper.accessor("employee", {
    header: "EMPLOYEE",
    size: 200,
    cell: (info) => (
      <span className="text-ehs-muted-text text-base font-semibold">
        {info.getValue()}
      </span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("quantity", {
    header: "QTY",
    size: 90,
    cell: (info) => (
      <span className="text-base text-[#2a3446] tabular-nums">
        {String(info.getValue())}
      </span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("size", {
    header: "SIZE",
    size: 140,
    cell: (info) => (
      <span className="text-ehs-muted-text text-base">{info.getValue()}</span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("issueDate", {
    header: "ISSUE DATE",
    size: 160,
    cell: (info) => (
      <span className="text-ehs-muted-text text-base">{info.getValue()}</span>
    ),
    meta: { align: "left" as const },
  }),
  columnHelper.accessor("status", {
    header: "STATUS",
    size: 120,
    cell: (info) => (
      <IncidentBadge
        label={info.getValue()}
        tone="muted"
        className="w-fit rounded-full px-2.5 py-0.5 text-base! font-semibold"
      />
    ),
    meta: { align: "left" as const },
  }),
];
