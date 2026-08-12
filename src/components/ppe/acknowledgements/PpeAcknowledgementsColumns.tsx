"use client";

import { createColumnHelper } from "@tanstack/react-table";
import type { TableColumns } from "@/components/ui/table-columns";
import { Button } from "@/components/ui/Button";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { PpeAcknowledgementEntry } from "@/app/dashboard/ppe-management/ppe-data";

const columnHelper = createColumnHelper<PpeAcknowledgementEntry>();

function AssignToCell(props: Readonly<{ entry: PpeAcknowledgementEntry }>) {
  const { entry } = props;

  return (
    <div className="flex items-center gap-2">
      <span
        className="text8 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#566072] text-white"
        aria-hidden="true"
      >
        {entry.initials}
      </span>
      <span className="text4 text-ehs-darker">{entry.assignToName}</span>
    </div>
  );
}

function ActionCell(props: Readonly<{ entry: PpeAcknowledgementEntry }>) {
  const { entry } = props;

  if (entry.acknowledged) {
    return (
      <IncidentBadge
        label="Acknowledged"
        tone="muted"
        className="w-fit bg-[rgba(16,185,129,0.12)] text-[#10b981]"
      />
    );
  }

  // Disabled properly rather than via pointer-events-none, which left the
  // button looking fully enabled while swallowing clicks — and still reachable
  // by keyboard, where it did nothing at all. Acknowledging on someone's
  // behalf has no endpoint yet.
  return (
    <Button
      type="button"
      variant="primary"
      disabled
      title="Acknowledging PPE from this table is not available yet"
      className="text4 rounded-lg px-3.5 py-1.5 shadow-[0px_4px_6px_rgba(8,145,166,0.25)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
    >
      Acknowledge
    </Button>
  );
}

/** Matches inventory / catalog issuance table typography (`text4` body cells). */
export function buildPpeAcknowledgementsColumns(): TableColumns<PpeAcknowledgementEntry> {
  return [
    columnHelper.display({
      id: "assignTo",
      header: "Assign to",
      size: 180,
      cell: (info) => <AssignToCell entry={info.row.original} />,
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("item", {
      header: "Item",
      size: 160,
      cell: (info) => (
        <span className="text4 text-ehs-slate">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("quantity", {
      header: "Quantity",
      size: 100,
      cell: (info) => (
        <span className="text4 text-ehs-gray tabular-nums">
          {String(info.getValue())}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("size", {
      header: "Size",
      size: 100,
      cell: (info) => (
        <span className="text4 text-ehs-gray">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("note", {
      header: "Note",
      size: 180,
      cell: (info) => {
        const note = info.getValue().trim();
        const words = note.split(/\s+/).filter(Boolean);
        const preview =
          words.length > 4 ? `${words.slice(0, 4).join(" ")}...` : note;

        return (
          <span className="text4 text-ehs-muted-text block" title={note}>
            {preview || "—"}
          </span>
        );
      },
      meta: { align: "left" as const },
    }),
    columnHelper.display({
      id: "action",
      header: "Action",
      size: 140,
      cell: (info) => (
        <div className="flex justify-end">
          <ActionCell entry={info.row.original} />
        </div>
      ),
      meta: { align: "right" as const },
    }),
  ];
}
