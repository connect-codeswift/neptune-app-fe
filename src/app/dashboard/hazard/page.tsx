"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  StatMetricCard,
  type StatMetricCardProps,
} from "@/components/StatMetricCard";
import { Table } from "@/components/ui/Table";
import { HazardFilterBar } from "@/components/hazard/HazardFilterBar";
import { HazardHeatmapCard } from "@/components/hazard/HazardHeatmapCard";
import { HazardRecognitionCard } from "@/components/hazard/HazardRecognitionCard";
import { hazardColumns } from "@/components/hazard/HazardColumns";
import { HAZARD_RECORDS } from "./hazard-data";

const HAZARD_METRICS: readonly StatMetricCardProps[] = [
  {
    title: "Total hazards reports",
    value: 32,
    trendValue: "+4",
    trendTone: "negative",
  },
  {
    title: "Converted to incidents",
    value: 48,
    trendValue: "-12",
    trendTone: "positive",
  },
];

export default function HazardPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredRecords = useMemo(() => {
    return HAZARD_RECORDS.filter(
      (record) =>
        selectedStatus === "All" || record.status === selectedStatus,
    );
  }, [selectedStatus]);

  const handleReportHazard = () => {
    router.push("/dashboard/hazard/report");
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-5">
      <DashboardHeader
        title="Hazard Reporting"
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        {/* KPI Metrics */}
        <div className="grid gap-4 sm:grid-cols-2">
          {HAZARD_METRICS.map((metric) => (
            <StatMetricCard key={metric.title} {...metric} />
          ))}
        </div>

        {/* Filter Bar */}
        <HazardFilterBar
          status={selectedStatus}
          onStatusChange={(status) => {
            setSelectedStatus(status);
            setSelectedId(null);
          }}
          onReportHazard={handleReportHazard}
        />

        {/* Records Table + Insights */}
        <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Table
            data={filteredRecords}
            columns={hazardColumns}
            selectedRowId={selectedId}
            onRowClick={(row) =>
              setSelectedId(row.id === selectedId ? null : row.id)
            }
            getRowId={(row) => row.id}
            containerClassName="min-w-0 shadow-sm"
          />

          <div className="flex min-w-0 flex-col gap-5">
            <HazardHeatmapCard />
            <HazardRecognitionCard />
          </div>
        </div>
      </div>
    </div>
  );
}
