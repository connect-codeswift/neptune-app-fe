"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Table, type TablePagination } from "@/components/ui/Table";
import {
  IncidentBadge,
  IncidentSegmentedControl,
} from "@/components/incidents";
import type { IncidentBadgeTone } from "@/components/incidents/list/IncidentBadge";
import { Text } from "@/components/Text";
import type {
  ComplianceObligationItem,
  ComplianceStatusType,
  JurisdictionType,
} from "./regulatory-compliance-types";

export type RegulatoryComplianceRegisterCardProps = Readonly<{
  items: readonly ComplianceObligationItem[];
  selectedJurisdiction: JurisdictionType;
  selectedStatus: ComplianceStatusType;
  onJurisdictionChange: (value: JurisdictionType) => void;
  onStatusChange: (value: ComplianceStatusType) => void;
  pagination?: TablePagination;
  isLoading?: boolean;
  className?: string;
}>;

const JURISDICTION_OPTIONS: readonly JurisdictionType[] = [
  "All",
  "Federal",
  "State",
  "Local",
];

const STATUS_OPTIONS: readonly ComplianceStatusType[] = [
  "All",
  "Compliant",
  "Due soon",
  "Action",
];

function statusTone(
  status: ComplianceObligationItem["status"],
): IncidentBadgeTone {
  if (status === "Compliant") return "success";
  if (status === "Action required") return "danger";
  return "warn";
}

const columnHelper = createColumnHelper<ComplianceObligationItem>();

const columns = [
  columnHelper.accessor("code", {
    header: "Code",
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text-ehs-gray text-[13px]">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("obligation", {
    header: "Obligation",
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text-ehs-dark-bg text-[13px]">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("jurisdiction", {
    header: "Jurisdiction",
    meta: { align: "center" },
    cell: (info) => <IncidentBadge label={info.getValue()} tone="muted" />,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    meta: { align: "center" },
    cell: (info) => (
      <IncidentBadge
        label={info.getValue()}
        tone={statusTone(info.getValue())}
      />
    ),
  }),
  columnHelper.accessor("nextDue", {
    header: "Next Due",
    meta: { align: "center" },
    cell: (info) => (
      <Text as="span" className="text-ehs-gray text-[13px]">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("evidenceText", {
    header: "Evidence",
    meta: { align: "right" },
    cell: (info) => (
      <Text as="span" className="text-ehs-normal-blue text-[13px]">
        {info.getValue()}
      </Text>
    ),
  }),
] as ColumnDef<ComplianceObligationItem, unknown>[];

export function RegulatoryComplianceRegisterCard(
  props: RegulatoryComplianceRegisterCardProps,
) {
  const {
    items,
    selectedJurisdiction,
    selectedStatus,
    onJurisdictionChange,
    onStatusChange,
    pagination,
    isLoading = false,
    className = "",
  } = props;
  const router = useRouter();

  const highlightedId = useMemo(
    () => items.find((item) => item.isHighlighted)?.id ?? null,
    [items],
  );

  return (
    <Table
      data={items}
      columns={columns}
      getRowId={(row) => row.id}
      selectedRowId={highlightedId}
      onRowClick={(row) =>
        router.push(`/dashboard/regulatory-compliance/${row.id}`)
      }
      containerClassName={className}
      pagination={
        pagination
          ? {
              ...pagination,
              isLoading,
            }
          : undefined
      }
      header={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Text
            as="h2"
            className="text-ehs-dark-bg text-[17px] leading-tight font-bold"
          >
            Register
          </Text>

          <div className="flex flex-wrap items-center gap-3">
            <IncidentSegmentedControl
              label=""
              options={JURISDICTION_OPTIONS}
              value={selectedJurisdiction}
              onChange={(value) =>
                onJurisdictionChange(value as JurisdictionType)
              }
              className="min-w-fit flex-none gap-0"
            />

            <IncidentSegmentedControl
              label=""
              options={STATUS_OPTIONS}
              value={selectedStatus}
              onChange={(value) => onStatusChange(value as ComplianceStatusType)}
              className="min-w-fit flex-none gap-0"
            />
          </div>
        </div>
      }
    />
  );
}
