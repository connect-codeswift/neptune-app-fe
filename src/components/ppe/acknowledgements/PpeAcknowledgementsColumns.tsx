"use client";

import { createColumnHelper } from "@tanstack/react-table";
import type { TableColumns } from "@/components/ui/table-columns";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import type { PpeAcknowledgementEntry } from "@/app/dashboard/ppe-management/ppe-data";

const columnHelper = createColumnHelper<PpeAcknowledgementEntry>();

function AssignToCell(props: Readonly<{ entry: PpeAcknowledgementEntry }>) {
  const { entry } = props;

  return (
    <div className="flex items-center gap-2">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#566072] text-xs font-bold text-white"
        aria-hidden="true"
      >
        {entry.initials}
      </span>
      <span className="text-ehs-darker text-base font-semibold">
        {entry.assignToName}
      </span>
    </div>
  );
}

function ActionCell(props: Readonly<{ entry: PpeAcknowledgementEntry }>) {
  const { entry } = props;

  if (entry.acknowledged) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(16,185,129,0.12)] px-2.5 py-1 text-base font-bold text-[#10b981]">
        <Icon
          icon="mdi:check"
          className="size-2.5 shrink-0"
          aria-hidden="true"
        />
        Acknowledged
      </span>
    );
  }

  return (
    <Button
      type="button"
      variant="primary"
      className="pointer-events-none rounded-lg px-3.5 py-1.5 text-lg font-bold shadow-[0px_4px_6px_rgba(8,145,166,0.25)]"
    >
      Acknowledge
    </Button>
  );
}

export function buildPpeAcknowledgementsColumns(): TableColumns<PpeAcknowledgementEntry> {
  return [
    columnHelper.display({
      id: "assignTo",
      header: "Assign To",
      size: 120,
      cell: (info) => <AssignToCell entry={info.row.original} />,
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("item", {
      header: "Item",
      size: 120,
      cell: (info) => (
        <span className="text-ehs-darker/80 text-base font-semibold">
          {info.getValue()}
        </span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("quantity", {
      header: "Quantity",
      size: 100,
      cell: (info) => (
        <span className="text-base text-[#566072]">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("size", {
      header: "Size",
      size: 120,
      cell: (info) => (
        <span className="text-base text-[#566072]">{info.getValue()}</span>
      ),
      meta: { align: "left" as const },
    }),
    columnHelper.accessor("note", {
      header: "Note",
      size: 120,
      cell: (info) => {
        const note = info.getValue().trim();
        const words = note.split(/\s+/).filter(Boolean);
        const preview =
          words.length > 4 ? `${words.slice(0, 4).join(" ")}...` : note;

        return (
          <span className="block text-base text-[#8892a3]" title={note}>
            {preview}
          </span>
        );
      },
      meta: { align: "left" as const },
    }),
    columnHelper.display({
      id: "action",
      header: "Action",
      size: 120,
      cell: (info) => (
        <div className="flex justify-end">
          <ActionCell entry={info.row.original} />
        </div>
      ),
      meta: { align: "right" as const },
    }),
  ];
}
