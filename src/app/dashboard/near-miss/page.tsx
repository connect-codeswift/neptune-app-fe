"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  StatMetricCard,
  type StatMetricCardProps,
} from "@/components/StatMetricCard";
import { Table } from "@/components/ui/Table";
import { NearMissFilterBar } from "@/components/near-miss/NearMissFilterBar";
import { NearMissHeatmapCard } from "@/components/near-miss/NearMissHeatmapCard";
import { NearMissRecognitionCard } from "@/components/near-miss/NearMissRecognitionCard";
import { nearMissColumns } from "@/components/near-miss/NearMissColumns";
import { NEAR_MISS_RECORDS } from "./near-miss-data";

const NEAR_MISS_METRICS: readonly StatMetricCardProps[] = [
  {
    title: "Total near misses",
    value: 32,
    trendValue: "-4",
    trendTone: "negative",
  },
  {
    title: "Converted to incidents",
    value: 48,
    trendValue: "+12",
    trendTone: "positive",
  },
];

export default function NearMissPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filter records by stage and site before passing to the table
  const filteredRecords = useMemo(() => {
    return NEAR_MISS_RECORDS.filter((record) => {
      const matchesStatus =
        selectedStatus === "All" || record.status === selectedStatus;
      return matchesStatus;
    });
  }, [selectedStatus]);

  const handleReportNearMiss = () => {
    router.push("/dashboard/near-miss/report");
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-5">
      <DashboardHeader
        title="Near Miss Reporting"
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        {/* KPI Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {NEAR_MISS_METRICS.map((metric) => (
            <StatMetricCard key={metric.title} {...metric} />
          ))}
        </div>

        {/* Dedicated Filter Bar */}
        <NearMissFilterBar
          status={selectedStatus}
          onStatusChange={(status) => {
            setSelectedStatus(status);
            setSelectedId(null);
          }}
          onReportNearMiss={handleReportNearMiss}
        />

        {/* Records Table + Insights */}
        <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Table
            data={filteredRecords}
            columns={nearMissColumns}
            selectedRowId={selectedId}
            onRowClick={(row) =>
              setSelectedId(row.id === selectedId ? null : row.id)
            }
            getRowId={(row) => row.id}
            containerClassName="min-w-0 shadow-sm"
          />

          <div className="flex min-w-0 flex-col gap-5">
            <NearMissHeatmapCard />
            <NearMissRecognitionCard />
          </div>
        </div>
      </div>
    </div>
  );
}
