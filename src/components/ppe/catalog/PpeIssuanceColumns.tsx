"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import type { TableColumns } from "@/components/ui/table-columns";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { PpeIssuanceRecord } from "@/app/dashboard/ppe-management/ppe-data";

const columnHelper = createColumnHelper<PpeIssuanceRecord>();

export type PpeIssuanceColumnHandlers = Readonly<{
  selectedId?: string | null;
  onView: (record: PpeIssuanceRecord) => void;
}>;

/** Issuance table — eye opens the details modal (no row-click navigation). */
export function makePpeIssuanceColumns(
  handlers: PpeIssuanceColumnHandlers,
): TableColumns<PpeIssuanceRecord> {
  const { selectedId = null, onView } = handlers;

  return [
    columnHelper.accessor("employee", {
      header: "Employee",
      size: 200,
      cell: (info) => (
        <span className="text4 text-ehs-darker">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("quantity", {
      header: "Qty",
      size: 90,
      cell: (info) => (
        <span className="text4 text-ehs-slate tabular-nums">
          {String(info.getValue())}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("size", {
      header: "Size",
      size: 140,
      cell: (info) => (
        <span className="text4 text-ehs-gray">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("issueDate", {
      header: "Issue date",
      size: 160,
      cell: (info) => (
        <span className="text4 text-ehs-gray">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: 120,
      cell: (info) => (
        <IncidentBadge label={info.getValue()} tone="muted" className="w-fit" />
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.display({
      id: "view",
      header: "",
      size: 56,
      cell: ({ row }) => {
        const isOpen = selectedId === row.original.id;

        return (
          <button
            type="button"
            className="text-ehs-muted-text hover:text-ehs-dark-bg inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            aria-label={
              isOpen
                ? `Close details for ${row.original.employee}`
                : `View details for ${row.original.employee}`
            }
            onClick={(event) => {
              event.stopPropagation();
              onView(row.original);
            }}
          >
            <Icon
              icon={
                isOpen
                  ? "icon-park-outline:preview-close-one"
                  : "lets-icons:view"
              }
              className="size-5"
              aria-hidden="true"
            />
          </button>
        );
      },
      meta: { align: "center" as const },
    }),
  ];
}
