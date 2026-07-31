"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Table } from "@/components/ui/Table";
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
  searchQuery?: string;
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
  const { items, searchQuery = "", className = "" } = props;
  const router = useRouter();

  const [selectedJurisdiction, setSelectedJurisdiction] =
    useState<JurisdictionType>("All");
  const [selectedStatus, setSelectedStatus] =
    useState<ComplianceStatusType>("All");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (
        selectedJurisdiction !== "All" &&
        item.jurisdiction !== selectedJurisdiction
      ) {
        return false;
      }

      if (selectedStatus !== "All") {
        if (selectedStatus === "Action" && item.status !== "Action required") {
          return false;
        }
        if (selectedStatus === "Compliant" && item.status !== "Compliant") {
          return false;
        }
        if (selectedStatus === "Due soon" && item.status !== "Due soon") {
          return false;
        }
      }

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchCode = item.code.toLowerCase().includes(q);
        const matchObligation = item.obligation.toLowerCase().includes(q);
        if (!matchCode && !matchObligation) {
          return false;
        }
      }

      return true;
    });
  }, [items, selectedJurisdiction, selectedStatus, searchQuery]);

  const highlightedId = items.find((item) => item.isHighlighted)?.id ?? null;

  return (
    <Table
      data={filteredItems}
      columns={columns}
      getRowId={(row) => row.id}
      selectedRowId={highlightedId}
      onRowClick={(row) =>
        router.push(`/dashboard/regulatory-compliance/${row.id}`)
      }
      containerClassName={className}
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
                setSelectedJurisdiction(value as JurisdictionType)
              }
              className="min-w-fit flex-none gap-0"
            />

            <IncidentSegmentedControl
              label=""
              options={STATUS_OPTIONS}
              value={selectedStatus}
              onChange={(value) =>
                setSelectedStatus(value as ComplianceStatusType)
              }
              className="min-w-fit flex-none gap-0"
            />
          </div>
        </div>
      }
    />
  );
}
