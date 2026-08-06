"use client";

import { useEffect, useMemo, useState } from "react";
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
import { makeHazardColumns } from "@/components/hazard/HazardColumns";
import { HazardPageSkeleton } from "@/components/hazard/HazardPageSkeleton";
import {
  useHazardKpiQuery,
  useHazardListQuery,
} from "@/hooks/use-hazard-queries";
import { canViewHazardInsights, getCurrentUser } from "@/lib/current-user";
import { mapHazardDtoToRecord, mapHazardKpiToMetrics } from "@/lib/map-hazard";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { toUserNameLookup } from "@/lib/map-user";

const PAGE_SIZE = 10;

export default function HazardPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [pageNumber, setPageNumber] = useState(1);

  // userId / siteId come from the signed-in user's access-token claims.
  const { userId, siteId } = getCurrentUser();
  const hazardListQuery = useHazardListQuery({
    pageNumber,
    pageSize: PAGE_SIZE,
    siteId,
    userId,
  });

  // The list carries a userId, not a reporter name — resolve it for display.
  const userDropdownQuery = useUserDropdownQuery();
  const users = userDropdownQuery.data?.dataModel;
  const userNames = useMemo(() => toUserNameLookup(users ?? []), [users]);

  // Resolve the role after mount: the token lives in localStorage, so reading
  // it during render would mismatch the server-rendered HTML.
  const [canViewInsights, setCanViewInsights] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time role read from localStorage token
    setCanViewInsights(canViewHazardInsights());
  }, []);

  // Only elevated roles see the KPI cards, so nobody else pays for the call.
  const kpiQuery = useHazardKpiQuery({ userId }, canViewInsights);

  const page = hazardListQuery.data?.dataModel;
  const metrics: readonly StatMetricCardProps[] = useMemo(
    () => mapHazardKpiToMetrics(kpiQuery.data?.dataModel),
    [kpiQuery.data],
  );

  const records = useMemo(
    () => (page?.data ?? []).map(mapHazardDtoToRecord),
    [page],
  );

  const filteredRecords = useMemo(() => {
    return records.filter(
      (record) => selectedStatus === "All" || record.status === selectedStatus,
    );
  }, [records, selectedStatus]);

  const columns = useMemo(() => makeHazardColumns({ userNames }), [userNames]);

  const handleReportHazard = () => {
    router.push("/dashboard/hazard/report");
  };

  // A disabled query stays "pending" forever, so only wait on it when enabled.
  const isPageLoading =
    hazardListQuery.isPending || (canViewInsights && kpiQuery.isPending);

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader title="Hazard Reporting" />

      {isPageLoading ? (
        <HazardPageSkeleton />
      ) : (
        <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
          {/* KPI Metrics — elevated roles only */}
          {canViewInsights ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {metrics.map((metric) => (
                <StatMetricCard key={metric.title} {...metric} />
              ))}
            </div>
          ) : null}

          {/* Filter Bar */}
          <HazardFilterBar
            status={selectedStatus}
            onStatusChange={setSelectedStatus}
            onReportHazard={handleReportHazard}
          />

          {/* Records Table + Insights — the table spans full width without them */}
          <div
            className={[
              "grid min-w-0 items-start gap-5",
              canViewInsights
                ? "xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Table
              data={filteredRecords}
              columns={columns}
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

            {canViewInsights ? (
              <div className="flex min-w-0 flex-col gap-5">
                <HazardHeatmapCard />
                <HazardRecognitionCard />
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
