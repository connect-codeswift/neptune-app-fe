"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Table, type TablePagination } from "@/components/ui/Table";
import { Text } from "@/components/Text";
import type { ComplianceObligationItem } from "./regulatory-compliance-types";
import { CompliancePill, complianceGlassCardClass } from "./compliance-ui";
import {
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_ACTION_ICON_CLASS,
} from "@/components/ui/table-header-action";

const CALENDAR_HREF = "/dashboard/regulatory-compliance/calendar";
const ADD_OBLIGATION_HREF = "/dashboard/regulatory-compliance/calendar/new";

export type RegulatoryComplianceRegisterCardProps = Readonly<{
  items: readonly ComplianceObligationItem[];
  selectedId: string | null;
  onViewMore: (id: string) => void;
  pagination?: TablePagination;
  isLoading?: boolean;
  className?: string;
}>;

const columnHelper = createColumnHelper<ComplianceObligationItem>();

function createObligationColumns(
  options: Readonly<{
    selectedId: string | null;
    onViewMore: (id: string) => void;
  }>,
): ColumnDef<ComplianceObligationItem, unknown>[] {
  const { selectedId, onViewMore } = options;

  return [
    columnHelper.accessor("code", {
      header: "Code",
      size: 116,
      meta: { align: "left" },
      cell: (info) => (
        <Text as="span" className="text7 text-ehs-muted-text">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("obligation", {
      header: "Obligation",
      size: 172,
      meta: { align: "left" },
      cell: (info) => (
        <Text as="span" className="text4 text-ehs-darker">
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
      size: 112,
      meta: { align: "center" },
      cell: (info) => (
        <Text
          as="span"
          className="text4 text-ehs-gray whitespace-nowrap tabular-nums"
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
        <Text as="span" className="text4 text-[#056e7e]">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.display({
      id: "view",
      header: "",
      size: 56,
      minSize: 48,
      meta: { align: "center" as const, verticalAlign: "middle" as const },
      cell: ({ row }) => {
        const isOpen = selectedId === row.original.id;

        return (
          <button
            type="button"
            className="text-ehs-muted-text hover:text-ehs-dark-bg inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            aria-label={
              isOpen
                ? `Close details for ${row.original.obligation}`
                : `View ${row.original.obligation}`
            }
            onClick={() => {
              onViewMore(row.original.id);
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
    }),
  ] as ColumnDef<ComplianceObligationItem, unknown>[];
}

export function RegulatoryComplianceRegisterCard(
  props: RegulatoryComplianceRegisterCardProps,
) {
  const {
    items,
    selectedId,
    onViewMore,
    pagination,
    isLoading = false,
    className = "",
  } = props;

  const columns = useMemo(
    () => createObligationColumns({ selectedId, onViewMore }),
    [selectedId, onViewMore],
  );

  return (
    <Table
      variant="compliance"
      data={items}
      columns={columns}
      getRowId={(row) => row.id}
      selectedRowId={selectedId}
      containerClassName={[complianceGlassCardClass, "min-w-0", className]
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
        <div className="flex h-12.5 items-center justify-between gap-3">
          <Text as="h2" className="text3 text-ehs-darker shrink-0">
            Obligations
          </Text>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={CALENDAR_HREF}
              aria-label="Open calendar view"
              title="Calendar view"
              className="text-ehs-normal-blue hover:bg-ehs-normal-blue/10 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <Icon
                icon="mdi:calendar-month-outline"
                className="size-4.5"
                aria-hidden
              />
            </Link>

            <Link
              href={ADD_OBLIGATION_HREF}
              className={[
                "bg-ehs-normal-blue hover:bg-ehs-normal-blue-hover text-ehs-light-text inline-flex items-center transition-colors",
                TABLE_HEADER_ACTION_CLASS,
              ].join(" ")}
            >
              <Icon
                icon="mdi:plus"
                className={TABLE_HEADER_ACTION_ICON_CLASS}
                aria-hidden
              />
              <span>Add Obligation</span>
            </Link>
          </div>
        </div>
      }
    />
  );
}
