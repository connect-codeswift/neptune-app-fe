"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Table, type TablePagination } from "@/components/ui/Table";
import { Text } from "@/components/Text";
import type { ComplianceObligationItem } from "./regulatory-compliance-types";
import { CompliancePill, complianceGlassCardClass } from "./compliance-ui";

const CALENDAR_HREF = "/dashboard/regulatory-compliance/calendar";
const ADD_OBLIGATION_HREF = "/dashboard/regulatory-compliance/calendar/new";

export type RegulatoryComplianceRegisterCardProps = Readonly<{
  items: readonly ComplianceObligationItem[];
  pagination?: TablePagination;
  isLoading?: boolean;
  className?: string;
}>;

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
  const { items, pagination, isLoading = false, className = "" } = props;
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
        <div className="flex h-[50.595px] items-center justify-between gap-3">
          <Text
            as="h2"
            className="shrink-0 text-[12px] leading-none font-bold text-[#0b1320]"
          >
            Register
          </Text>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={CALENDAR_HREF}
              aria-label="Open calendar view"
              title="Calendar view"
              className="text-ehs-normal-blue hover:bg-ehs-normal-blue/10 inline-flex size-9 cursor-pointer items-center justify-center rounded-xl transition-colors"
            >
              <Icon
                icon="mdi:calendar-month-outline"
                className="size-5"
                aria-hidden
              />
            </Link>

            <Link
              href={ADD_OBLIGATION_HREF}
              className="bg-ehs-normal-blue hover:bg-ehs-normal-blue-hover text-ehs-light-text inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
            >
              <Icon icon="mdi:plus" className="size-4" aria-hidden />
              <span className="whitespace-nowrap">Add Obligation</span>
            </Link>
          </div>
        </div>
      }
    />
  );
}
