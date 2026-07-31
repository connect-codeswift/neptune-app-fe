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
import {
  InspectionDetailPanelSkeleton,
  InspectionPageSkeleton,
} from "@/components/inspections/InspectionPageSkeleton";
import { InspectionRegisterToolbar } from "@/components/inspections/InspectionRegisterToolbar";
import {
  useInspectionDetailQuery,
  useInspectionsQuery,
} from "@/hooks/use-inspection-queries";
import {
  mapInspectionDetailDtoToDetail,
  mapInspectionDtoToRecord,
} from "@/lib/map-inspection";

const PAGE_SIZE = 10;

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const inspectionsQuery = useInspectionsQuery({
    pageNumber,
    pageSize: PAGE_SIZE,
  });
  const page = inspectionsQuery.data?.dataModel;
  const records = useMemo(
    () => (page?.data ?? []).map(mapInspectionDtoToRecord),
    [page],
  );

  // Only offer filters for statuses the backend actually returned.
  const statuses = useMemo(
    () => ["All", ...new Set(records.map((record) => record.status))],
    [records],
  );

  // If the chosen status vanishes on a refetch, fall back to "All" rather than
  // leaving the table empty with no segment selected.
  const activeStatus = statuses.includes(selectedStatus)
    ? selectedStatus
    : "All";

  const filteredRecords = useMemo(
    () =>
      records.filter(
        (record) => activeStatus === "All" || record.status === activeStatus,
      ),
    [records, activeStatus],
  );

  // Fetch the clicked inspection's detail for the side panel.
  const detailQuery = useInspectionDetailQuery(selectedId);
  const detailDto = detailQuery.data?.dataModel ?? null;
  const detail = useMemo(
    () => (detailDto ? mapInspectionDetailDtoToDetail(detailDto) : null),
    [detailDto],
  );

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader
        title="Inspections"
        searchPlaceholder="Search incidents, actions, docs..."
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
        // actionLabel="Start Inspection"
        // onActionClick={() => router.push("/dashboard/inspections/start")}
      />
      {inspectionsQuery.isPending ? (
        <InspectionPageSkeleton />
      ) : (
        <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
          {/* KPI Metrics */}
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            {INSPECTION_METRICS.map((metric) => (
              <StatMetricCard key={metric.title} {...metric} />
            ))}
          </div>

          {inspectionsQuery.isError ? (
            <p className="text-ehs-red text-sm">Could not load inspections.</p>
          ) : null}

          {/* Inspection register + selected inspection breakdown */}
          <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Table
              data={filteredRecords}
              columns={inspectionColumns}
              selectedRowId={selectedId}
              onRowClick={(row) => setSelectedId(row.id)}
              getRowId={(row) => row.id}
              containerClassName="min-w-0"
              pagination={{
                pageNumber,
                pageSize: PAGE_SIZE,
                totalRecords: page?.totalRecords ?? 0,
                onPageChange: setPageNumber,
                isLoading: inspectionsQuery.isFetching,
              }}
              header={
                <InspectionRegisterToolbar
                  status={activeStatus}
                  statuses={statuses}
                  onStatusChange={setSelectedStatus}
                  onTemplatesClick={() =>
                    router.push("/dashboard/inspections/template")
                  }
                />
              }
            />

            {selectedId !== null ? (
              detailQuery.isPending ? (
                <InspectionDetailPanelSkeleton />
              ) : detailQuery.isError ? (
                <p className="text-ehs-red text-sm">
                  Could not load inspection detail.
                </p>
              ) : detail ? (
                <InspectionDetailPanel
                  detail={detail}
                  className="min-w-0"
                  onViewFindings={() =>
                    router.push(
                      `/dashboard/inspections/report?inspectionid=${encodeURIComponent(selectedId)}`,
                    )
                  }
                />
              ) : null
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
