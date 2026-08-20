"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DashboardHeader } from "@/components/DashboardHeader";
import { IhModuleTabs } from "@/components/industrial-hygiene/IhModuleTabs";
import { IhPageHeader } from "@/components/industrial-hygiene/IhPageHeader";
import { IhSearchToolbar } from "@/components/industrial-hygiene/IhSearchToolbar";
import { IH_LOG_RESULT_PATH } from "@/components/industrial-hygiene/ih-log-result-data";
import { ihMonitoringRecordPath } from "@/components/industrial-hygiene/ih-monitoring-record-detail-data";
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
          ? "bg-ehs-red/12 text-ehs-red"
          : "bg-ehs-green/12 text-ehs-green",
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
      <Text as="span" className="text-ehs-normal-blue text-sm font-bold">
        {row.original.code}
      </Text>
    ),
  },
  {
    id: "agent",
    header: "Agent",
    cell: ({ row }) => (
      <div className="min-w-36 py-1">
        <Text as="p" className="text-ehs-dark-bg text-sm font-semibold">
          {row.original.agent}
        </Text>
        <Text as="p" className="text-ehs-placeholder text-sm">
          {row.original.sampleType}
        </Text>
      </div>
    ),
  },
  {
    id: "employee",
    header: "Employee / Group",
    cell: ({ row }) => (
      <Text as="span" className="text-ehs-slate text-sm">
        {row.original.employee}
      </Text>
    ),
  },
  {
    id: "workArea",
    header: "Work Area",
    cell: ({ row }) => (
      <Text as="span" className="text-ehs-gray text-sm">
        {row.original.workArea}
      </Text>
    ),
  },
  {
    id: "method",
    header: "Method",
    cell: ({ row }) => (
      <Text as="span" className="text-ehs-gray text-sm">
        {row.original.method}
      </Text>
    ),
  },
  {
    id: "result",
    header: "Result",
    cell: ({ row }) => (
      <div className="flex items-baseline gap-1">
        <Text as="span" className="text-ehs-gray text-sm font-extrabold">
          {row.original.resultValue}
        </Text>
        <Text as="span" className="text-ehs-muted-text text-sm">
          {row.original.resultUnit}
        </Text>
      </div>
    ),
  },
  {
    id: "oel",
    header: "OEL",
    cell: ({ row }) => (
      <Text as="span" className="text-ehs-gray font-mono text-sm">
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
      <Text as="span" className="text-ehs-gray text-xs">
        {row.original.date}
      </Text>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        href={ihMonitoringRecordPath(row.original.id)}
        aria-label={`View ${row.original.code}`}
        className="bg-ehs-gray/14 text-ehs-gray hover:bg-ehs-gray/22 inline-flex size-7 items-center justify-center rounded-md transition-colors"
      >
        <Icon icon="mdi:eye-outline" className="size-4" aria-hidden />
      </Link>
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/industrial-hygiene/download.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="size-4"
                />
                Export
              </Button>
              <Link href={IH_LOG_RESULT_PATH}>
                <Button
                  type="button"
                  variant="primary"
                  className="rounded-lg px-3.5 py-2 text-base! font-semibold"
                >
                  <Icon icon="mdi:plus" className="size-4" aria-hidden />
                  Log Result
                </Button>
              </Link>
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
