"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  StatMetricCard,
  type StatMetricCardProps,
} from "@/components/StatMetricCard";
import { Table } from "@/components/ui/Table";
import { inspectionColumns } from "@/components/inspections/InspectionColumns";
import { InspectionDetailPanel } from "@/components/inspections/InspectionDetailPanel";
import { InspectionRegisterToolbar } from "@/components/inspections/InspectionRegisterToolbar";
import { INSPECTION_RECORDS, getInspectionDetail } from "./inspections-data";

const INSPECTION_METRICS: readonly StatMetricCardProps[] = [
  {
    title: "Inspections YTD",
    value: 29,
    trendValue: "+5",
    trendTone: "positive",
  },
  {
    title: "Open findings",
    value: 19,
    trendValue: "-4",
    trendTone: "negative",
  },
  {
    title: "On-time closure",
    value: "92%",
    trendValue: "+2pp",
    trendTone: "positive",
  },
  {
    title: "Avg findings/inspection",
    value: "2.1",
    trendValue: "-0.3",
    trendTone: "negative",
  },
];

export default function InspectionsPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedId, setSelectedId] = useState<string | null>(
    INSPECTION_RECORDS[0]?.id ?? null,
  );

  const filteredRecords = useMemo(
    () =>
      INSPECTION_RECORDS.filter(
        (record) =>
          selectedStatus === "All" || record.status === selectedStatus,
      ),
    [selectedStatus],
  );

  const detail = getInspectionDetail(selectedId);

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader
        title="Inspections"
        searchPlaceholder="Search incidents, actions, docs..."
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
        actionLabel="Start Inspection"
        onActionClick={() => router.push("/dashboard/inspections/start")}
      />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        {/* KPI Metrics */}
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {INSPECTION_METRICS.map((metric) => (
            <StatMetricCard key={metric.title} {...metric} />
          ))}
        </div>

        {/* Inspection register + selected inspection breakdown */}
        <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Table
            data={filteredRecords}
            columns={inspectionColumns}
            selectedRowId={selectedId}
            onRowClick={(row) => setSelectedId(row.id)}
            getRowId={(row) => row.id}
            containerClassName="min-w-0"
            header={
              <InspectionRegisterToolbar
                status={selectedStatus}
                onStatusChange={setSelectedStatus}
                onTemplatesClick={() =>
                  router.push("/dashboard/inspections/template")
                }
              />
            }
          />

          {detail ? (
            <InspectionDetailPanel detail={detail} className="min-w-0" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
