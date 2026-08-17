"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DashboardHeader } from "@/components/DashboardHeader";
import { IhModuleTabs } from "@/components/industrial-hygiene/IhModuleTabs";
import { IhPageHeader } from "@/components/industrial-hygiene/IhPageHeader";
import { IhSearchToolbar } from "@/components/industrial-hygiene/IhSearchToolbar";
import {
  IH_MONITORING_ROWS,
  type IhMonitoringRow,
  type IhMonitoringStatus,
} from "@/components/industrial-hygiene/ih-monitoring-records-data";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { Text } from "@/components/Text";

function MonitoringStatusBadge(
  props: Readonly<{ status: IhMonitoringStatus }>,
) {
  const isExceeded = props.status === "Exceeded";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold",
        isExceeded
          ? "bg-[rgba(239,68,68,0.12)] text-[#ef4444]"
          : "bg-[rgba(16,185,129,0.12)] text-[#10b981]",
      ].join(" ")}
    >
      {props.status}
    </span>
  );
}

const MONITORING_COLUMNS: ColumnDef<IhMonitoringRow, unknown>[] = [
  {
    id: "code",
    header: "ID",
    cell: ({ row }) => (
      <Text as="span" className="text-sm font-bold text-[#0891a6]">
        {row.original.code}
      </Text>
    ),
  },
  {
    id: "agent",
    header: "Agent",
    cell: ({ row }) => (
      <div className="min-w-36 py-1">
        <Text as="p" className="text-sm font-semibold text-[#0b1320]">
          {row.original.agent}
        </Text>
        <Text as="p" className="text-sm text-[#b3bbc8]">
          {row.original.sampleType}
        </Text>
      </div>
    ),
  },
  {
    id: "employee",
    header: "Employee / Group",
    cell: ({ row }) => (
      <Text as="span" className="text-sm text-[#2a3446]">
        {row.original.employee}
      </Text>
    ),
  },
  {
    id: "workArea",
    header: "Work Area",
    cell: ({ row }) => (
      <Text as="span" className="text-sm text-[#566072]">
        {row.original.workArea}
      </Text>
    ),
  },
  {
    id: "method",
    header: "Method",
    cell: ({ row }) => (
      <Text as="span" className="text-sm text-[#566072]">
        {row.original.method}
      </Text>
    ),
  },
  {
    id: "result",
    header: "Result",
    cell: ({ row }) => (
      <div className="flex items-baseline gap-1">
        <Text as="span" className="text-sm font-extrabold text-[#566072]">
          {row.original.resultValue}
        </Text>
        <Text as="span" className="text-sm text-[#8892a3]">
          {row.original.resultUnit}
        </Text>
      </div>
    ),
  },
  {
    id: "oel",
    header: "OEL",
    cell: ({ row }) => (
      <Text as="span" className="font-mono text-sm text-[#566072]">
        {row.original.oel}
      </Text>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <MonitoringStatusBadge status={row.original.status} />,
  },
  {
    id: "date",
    header: "Date",
    cell: ({ row }) => (
      <Text as="span" className="text-xs text-[#566072]">
        {row.original.date}
      </Text>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: () => (
      <button
        type="button"
        aria-label="View record"
        className="inline-flex size-7 items-center justify-center rounded-md bg-[rgba(86,96,114,0.14)] text-[#566072] transition-colors hover:bg-[rgba(86,96,114,0.22)]"
      >
        <Icon icon="mdi:eye-outline" className="size-4" aria-hidden />
      </button>
    ),
  },
];

/** Monitoring Records tab — Figma 5313:32289. */
export function IhMonitoringRecordsView() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return IH_MONITORING_ROWS;
    return IH_MONITORING_ROWS.filter(
      (row) =>
        row.code.toLowerCase().includes(q) ||
        row.agent.toLowerCase().includes(q) ||
        row.employee.toLowerCase().includes(q) ||
        row.workArea.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <DashboardHeader title="Industrial Hygiene Dashboard" showSiteSwitcher />

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-4 pb-8">
        <IhModuleTabs />

        <IhPageHeader
          breadcrumb={["Safety", "Industrial Hygiene", "Monitoring Records"]}
          title="Monitoring Records"
          subtitle="All exposure sampling results — color-coded by OEL comparison status"
          actions={
            <>
              <Button
                type="button"
                variant="tertiary"
                className="rounded-lg px-3.5 py-2 text-base! font-semibold"
              >
                <Icon
                  icon="mdi:export-variant"
                  className="size-4"
                  aria-hidden
                />
                Export
              </Button>
              <Button
                type="button"
                variant="primary"
                className="rounded-lg px-3.5 py-2 text-base! font-semibold"
              >
                <Icon icon="mdi:plus" className="size-4" aria-hidden />
                Log Result
              </Button>
            </>
          }
        />

        <IhSearchToolbar
          value={query}
          onChange={setQuery}
          aria-label="Search monitoring records"
          resultLabel={`${String(filtered.length)} chemicals`}
        />

        <Table
          data={filtered}
          columns={MONITORING_COLUMNS}
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}
