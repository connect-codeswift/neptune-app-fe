"use client";

import { createColumnHelper } from "@tanstack/react-table";
import type { TableColumns } from "@/components/ui/table-columns";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type {
  PpeIssuanceLogEntry,
  PpeLogStatus,
} from "@/app/dashboard/ppe-management/ppe-data";

const columnHelper = createColumnHelper<PpeIssuanceLogEntry>();

const statusTone: Record<PpeLogStatus, "muted" | "neutral"> = {
  Issued: "muted",
  "Due Inspection": "muted",
  Overdue: "muted",
  Returned: "neutral",
};

export type PpeIssuanceLogColumnsOptions = Readonly<{
  onReturn?: (entry: PpeIssuanceLogEntry) => void;
}>;

export function buildPpeIssuanceLogColumns(
  options: PpeIssuanceLogColumnsOptions = {},
): TableColumns<PpeIssuanceLogEntry> {
  const { onReturn } = options;

  return [
    columnHelper.accessor("issueId", {
      header: "ID",
      size: 90,
      cell: (info) => (
        <span className="text-ehs-muted-text text-base font-bold">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("employee", {
      header: "EMPLOYEE",
      size: 120,
      cell: (info) => (
        <span className="text-ehs-darker text-base font-semibold">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("ppeItem", {
      header: "PPE ITEM",
      size: 120,
      cell: (info) => (
        <span className="text-base text-[#2a3446]">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("qtySize", {
      header: "QTY / SIZE",
      size: 120,
      cell: (info) => (
        <span className="text-ehs-muted-text text-base">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("issueDate", {
      header: "DATE",
      size: 110,
      cell: (info) => (
        <span className="text-ehs-muted-text text-base">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    // columnHelper.accessor("returnDate", {
    //   header: "RETURN DATE",
    //   size: 120,
    //   cell: (info) => {
    //     const value = info.getValue();
    //     return (
    //       <span
    //         className={[
    //           "text-sm",
    //           value === "—" ? "text-[#b3bbc8]" : "text-ehs-muted-text",
    //         ].join(" ")}
    //       >
    //         {value}
    //       </span>
    //     );
    //   },
    //   meta: { align: "left" as const },
    // }),
    // columnHelper.accessor("condition", {
    //   header: "CONDITION",
    //   size: 120,
    //   cell: (info) => (
    //     <span className="text-ehs-muted-text text-sm">{info.getValue()}</span>
    //   ),
    //   meta: { align: "left" as const },
    // }),
    columnHelper.accessor("status", {
      header: "STATUS",
      size: 130,
      cell: (info) => (
        <IncidentBadge
          label={info.getValue()}
          tone="muted"
          className={[
            "w-fit rounded-full px-2.5 py-0.5 text-sm! font-semibold",
            info.getValue() === "Returned"
              ? "bg-[rgba(15,23,42,0.08)] text-[#8892a3]"
              : "",
          ].join(" ")}
        />
      ),
      meta: { align: "left" as const },
    }),
    // columnHelper.display({
    //   id: "action",
    //   header: "ACTION",
    //   size: 90,
    //   cell: ({ row }) => {
    //     if (!row.original.canReturn) return null;
    //     return (
    //       <button
    //         type="button"
    //         className="cursor-pointer rounded-[7px] bg-[rgba(15,23,42,0.06)] px-2.5 py-1 text-sm font-medium text-[#566072] transition-colors hover:bg-[rgba(15,23,42,0.1)]"
    //         onClick={(event) => {
    //           event.stopPropagation();
    //           onReturn?.(row.original);
    //         }}
    //       >
    //         Return
    //       </button>
    //     );
    //   },
    //   meta: { align: "left" as const },
    // }),
  ];
}
