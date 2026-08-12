"use client";

import { useMemo } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Text } from "@/components/Text";
import { Table } from "@/components/ui/Table";
import type { AcknowledgmentRecord } from "@/components/policy-maker/acknowledgment-tracking/acknowledgment-tracking-types";

export type AcknowledgmentTrackingTableProps = Readonly<{
  records: readonly AcknowledgmentRecord[];
  className?: string;
}>;

const columnHelper = createColumnHelper<AcknowledgmentRecord>();

function StatusCell(
  props: Readonly<{ status: AcknowledgmentRecord["status"] }>,
) {
  const { status } = props;
  const isAcknowledged = status === "Acknowledged";

  return (
    <span
      className={[
        "text-xs leading-4",
        isAcknowledged ? "text-[#10b981]" : "text-[#457b9d]",
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function createColumns(): ColumnDef<AcknowledgmentRecord, unknown>[] {
  return [
    columnHelper.accessor("name", {
      header: "Name",
      size: 200,
      meta: { align: "left" as const },
      cell: ({ getValue }) => (
        <Text as="span" className="text-3.5 leading-5 text-[#0b1320]">
          {getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("department", {
      header: "Department",
      size: 180,
      meta: { align: "left" as const },
      cell: ({ getValue }) => (
        <Text as="span" className="text-3.5 leading-5 text-[#566072]">
          {getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: 160,
      meta: { align: "left" as const },
      cell: ({ getValue }) => <StatusCell status={getValue()} />,
    }),
    columnHelper.accessor("acknowledgedDate", {
      header: "Acknowledged Date",
      size: 180,
      meta: { align: "left" as const },
      cell: ({ getValue }) => (
        <Text as="span" className="text-xs leading-4 text-[#566072]">
          {getValue() ?? "—"}
        </Text>
      ),
    }),
  ] as ColumnDef<AcknowledgmentRecord, unknown>[];
}

/**
 * Acknowledgment roster table via TanStack (Figma 5568:25520).
 */
export function AcknowledgmentTrackingTable(
  props: Readonly<AcknowledgmentTrackingTableProps>,
) {
  const { records, className = "" } = props;
  const columns = useMemo(() => createColumns(), []);

  return (
    <Table
      data={records}
      columns={columns}
      getRowId={(row) => row.id}
      containerClassName={className}
      className="min-w-160"
    />
  );
}
