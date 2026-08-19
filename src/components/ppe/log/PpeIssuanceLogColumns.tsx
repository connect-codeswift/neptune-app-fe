"use client";

import { createColumnHelper } from "@tanstack/react-table";
import type { TableColumns } from "@/components/ui/table-columns";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { PpeIssuanceLogEntry } from "@/app/dashboard/ppe-management/ppe-data";

const columnHelper = createColumnHelper<PpeIssuanceLogEntry>();

export function buildPpeIssuanceLogColumns(): TableColumns<PpeIssuanceLogEntry> {
  return [
    columnHelper.accessor("issueId", {
      header: "ID",
      size: 90,
      cell: (info) => (
        <span className="text7 text-ehs-muted-text">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("employee", {
      header: "Employee",
      size: 160,
      cell: (info) => (
        <span className="text4 text-ehs-darker">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("ppeItem", {
      header: "PPE item",
      size: 160,
      cell: (info) => (
        <span className="text4 text-ehs-slate">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("qtySize", {
      header: "Qty / size",
      size: 120,
      cell: (info) => (
        <span className="text4 text-ehs-gray">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("issueDate", {
      header: "Date",
      size: 110,
      cell: (info) => (
        <span className="text4 text-ehs-gray">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    // columnHelper.accessor("returnDate", {
    //   header: "Return date",
    //   size: 120,
    //   cell: (info) => {
    //     const value = info.getValue();
    //     return (
    //       <span
    //         className={[
    //           "text4",
    //           value === "—" ? "text-ehs-muted-text" : "text-ehs-muted-text",
    //         ].join(" ")}
    //       >
    //         {value}
    //       </span>
    //     );
    //   },
    //   meta: { align: "left" as const },
    // }),
    // columnHelper.accessor("condition", {
    //   header: "Condition",
    //   size: 120,
    //   cell: (info) => (
    //     <span className="text4 text-ehs-muted-text">{info.getValue()}</span>
    //   ),
    //   meta: { align: "left" as const },
    // }),
    columnHelper.accessor("status", {
      header: "Status",
      size: 130,
      cell: (info) => (
        <IncidentBadge
          label={info.getValue()}
          tone="muted"
          className={[
            "w-fit",
            info.getValue() === "Returned"
              ? "bg-ehs-surface-inverse/8 text-ehs-muted-text"
              : "",
          ].join(" ")}
        />
      ),
      meta: { align: "left" as const },
    }),
    // An ACTION column with a per-row Return button belongs here, but
    // recording a return has no endpoint yet (use-ppe-mutations covers issue
    // and replacement only). Left out rather than wired to a fake success
    // toast; add it back with the mutation when the endpoint lands.
  ];
}
