"use client";

import { useRouter } from "next/navigation";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Table, type TablePagination } from "@/components/ui/Table";
import { Text } from "@/components/Text";
import type {
  ComplianceObligationItem,
  ComplianceStatusType,
  JurisdictionType,
} from "./regulatory-compliance-types";
import {
  CompliancePill,
  ComplianceSegmentedFilter,
  complianceGlassCardClass,
} from "./compliance-ui";

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
  "Action required",
  "Upcoming",
];

const columnHelper = createColumnHelper<ComplianceObligationItem>();

const columns = [
  columnHelper.accessor("code", {
    header: "Code",
    size: 116,
    meta: { align: "left" },
    cell: (info) => (
      <Text
        as="span"
        className="text-[10px] leading-normal font-bold text-[#8892a3]"
      >
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("obligation", {
    header: "Obligation",
    size: 172,
    meta: { align: "left" },
    cell: (info) => (
      <Text as="span" className="text-[12px] leading-normal text-[#0b1320]">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("jurisdiction", {
    header: "Jurisdiction",
    size: 113,
    meta: { align: "center" },
    cell: (info) => <CompliancePill label={info.getValue()} />,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    size: 131,
    meta: { align: "center" },
    cell: (info) => <CompliancePill label={info.getValue()} />,
  }),
  columnHelper.accessor("nextDue", {
    header: "Next due",
    // 81px forced ISO dates to wrap mid-value ("2026-09-\n05").
    size: 112,
    meta: { align: "center" },
    cell: (info) => (
      <Text
        as="span"
        className="text-[12px] leading-normal whitespace-nowrap tabular-nums text-[#566072]"
      >
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor("evidenceText", {
    header: "Evidence",
    size: 90,
    meta: { align: "right" },
    cell: (info) => (
      <Text as="span" className="text-[10px] leading-normal text-[#056e7e]">
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

  return (
    <Table
      variant="compliance"
      data={items}
      columns={columns}
      getRowId={(row) => row.id}
      onRowClick={(row) =>
        router.push(`/dashboard/regulatory-compliance/${row.id}`)
      }
      containerClassName={[complianceGlassCardClass, className]
        .filter(Boolean)
        .join(" ")}
      pagination={
        pagination
          ? {
              ...pagination,
              isLoading,
            }
          : undefined
      }
      header={
        <div className="flex h-[50.595px] items-center">
          <Text
            as="h2"
            className="shrink-0 text-[12px] leading-none font-bold text-[#0b1320]"
          >
            Register
          </Text>

          <div className="ml-auto flex items-center gap-[10px]">
            <ComplianceSegmentedFilter
              options={JURISDICTION_OPTIONS}
              value={selectedJurisdiction}
              onChange={(value) => onJurisdictionChange(value)}
            />

            <ComplianceSegmentedFilter
              options={STATUS_OPTIONS}
              value={selectedStatus}
              onChange={(value) => onStatusChange(value)}
            />
          </div>
        </div>
      }
    />
  );
}
