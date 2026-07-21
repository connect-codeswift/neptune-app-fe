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
import { HazardPageSkeleton } from "@/components/hazard/HazardPageSkeleton";
import {
  useHazardKpiQuery,
  useHazardListQuery,
} from "@/hooks/use-hazard-queries";
import { getCurrentUser } from "@/lib/current-user";
import { mapHazardDtoToRecord } from "@/lib/map-hazard";

const PAGE_SIZE = 10;

export default function HazardPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [pageNumber, setPageNumber] = useState(1);

  // userId / subCompanyId come from the signed-in user's access-token claims.
  const { userId, subCompanyId } = getCurrentUser();
  const hazardListQuery = useHazardListQuery({
    pageNumber,
    pageSize: PAGE_SIZE,
    subCompanyId,
    userId,
  });
  const kpiQuery = useHazardKpiQuery();

  const page = hazardListQuery.data?.dataModel;

  const metrics: readonly StatMetricCardProps[] = useMemo(() => {
    const kpi = kpiQuery.data?.dataModel;

    return [
      {
        title: "Total hazards reports",
        value: kpi?.totalHazardCount ?? 0,
      },
      {
        title: "Converted to incidents",
        value:
          kpi?.convertedToIncidents ??
          kpi?.convertedIncidents ??
          kpi?.converted ??
          0,
      },
    ];
  }, [kpiQuery.data]);

  const records = useMemo(
    () => (page?.data ?? []).map(mapHazardDtoToRecord),
    [page],
  );

  const filteredRecords = useMemo(() => {
    return records.filter(
      (record) => selectedStatus === "All" || record.status === selectedStatus,
    );
  }, [records, selectedStatus]);

  const handleReportHazard = () => {
    router.push("/dashboard/hazard/report");
  };

  const isPageLoading = hazardListQuery.isPending || kpiQuery.isPending;

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-5">
      <DashboardHeader
        title="Hazard Reporting"
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      {isPageLoading ? (
        <HazardPageSkeleton />
      ) : (
        <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
          {/* KPI Metrics */}
          <div className="grid gap-4 sm:grid-cols-2">
            {metrics.map((metric) => (
              <StatMetricCard key={metric.title} {...metric} />
            ))}
          </div>

          {/* Filter Bar */}
          <HazardFilterBar
            status={selectedStatus}
            onStatusChange={setSelectedStatus}
            onReportHazard={handleReportHazard}
          />

          {/* Records Table + Insights */}
          <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Table
              data={filteredRecords}
              columns={hazardColumns}
              onRowClick={(row) =>
                router.push(`/dashboard/hazard/${encodeURIComponent(row.id)}`)
              }
              getRowId={(row) => row.id}
              containerClassName="min-w-0 shadow-sm"
              pagination={{
                pageNumber: page?.pageNumber ?? pageNumber,
                pageSize: page?.pageSize ?? PAGE_SIZE,
                totalRecords: page?.totalRecords ?? 0,
                onPageChange: setPageNumber,
                isLoading: hazardListQuery.isFetching,
              }}
            />

            <div className="flex min-w-0 flex-col gap-5">
              <HazardHeatmapCard />
              <HazardRecognitionCard />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
