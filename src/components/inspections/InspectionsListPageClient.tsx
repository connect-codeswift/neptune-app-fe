"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Table } from "@/components/ui/Table";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import { StatMetricCard } from "@/components/StatMetricCard";
import { inspectionColumns } from "@/components/inspections/InspectionColumns";
import { InspectionDetailPanel } from "@/components/inspections/InspectionDetailPanel";
import {
  InspectionDetailPanelSkeleton,
  InspectionPageSkeleton,
} from "@/components/inspections/InspectionPageSkeleton";
import {
  useInspectionDetailSummaryQuery,
  useInspectionsQuery,
  useInspectionSummaryQuery,
} from "@/hooks/use-inspection-queries";
import { mapInspectionDtoToRecord } from "@/lib/map-inspection";
import {
  mapInspectionDetailSummaryToDetail,
  mapSummaryToMetrics,
} from "@/lib/map-audit-inspection-dashboard";
import {
  REGISTER_STATUS_FILTERS,
  toApiStatusFilter,
  type RegisterStatusFilter,
} from "@/lib/audit-inspection-status";
import { detailSummaryErrorMessage } from "@/lib/audit-inspection-errors";
import { getCurrentUser } from "@/lib/current-user";

const PAGE_SIZE = 10;

export function InspectionsListPageClient() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] =
    useState<RegisterStatusFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const { userId } = getCurrentUser();
  const summaryQuery = useInspectionSummaryQuery(userId);

  const listParams = useMemo(
    () => ({
      pageNumber,
      pageSize: PAGE_SIZE,
      status: toApiStatusFilter(selectedStatus),
    }),
    [pageNumber, selectedStatus],
  );

  const inspectionsQuery = useInspectionsQuery(listParams);

  const page = inspectionsQuery.data?.dataModel;
  const records = useMemo(
    () => (page?.data ?? []).map(mapInspectionDtoToRecord),
    [page],
  );

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return records;

    return records.filter((record) => {
      const haystack = [
        record.id,
        record.title,
        record.scope,
        record.site,
        record.inspector,
        record.status,
        record.dueDate,
        record.findings ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [records, searchQuery]);

  const detailSummaryQuery = useInspectionDetailSummaryQuery(selectedId);
  const detail = useMemo(() => {
    const dto = detailSummaryQuery.data?.dataModel;
    return dto ? mapInspectionDetailSummaryToDetail(dto) : null;
  }, [detailSummaryQuery.data]);

  const metrics = useMemo(
    () => mapSummaryToMetrics(summaryQuery.data?.dataModel, "inspection"),
    [summaryQuery.data],
  );

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader title="Inspections" />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        {summaryQuery.isPending ? (
          <InspectionPageSkeleton />
        ) : (
          <>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <StatMetricCard key={metric.title} {...metric} />
              ))}
            </div>

            {summaryQuery.isError ? (
              <p className="text-ehs-red text-sm">
                Could not load inspection KPIs.
              </p>
            ) : null}
          </>
        )}

        {inspectionsQuery.isPending && !inspectionsQuery.data ? (
          <InspectionPageSkeleton />
        ) : (
          <>
            {inspectionsQuery.isError ? (
              <p className="text-ehs-red text-sm">Could not load inspections.</p>
            ) : null}

            <ModuleFilterBar
              segments={[
                {
                  label: "Status",
                  options: REGISTER_STATUS_FILTERS,
                  value: selectedStatus,
                  onChange: (value) => {
                    setSelectedStatus(value as RegisterStatusFilter);
                    setPageNumber(1);
                  },
                },
              ]}
              action={{
                label: "Templates",
                icon: "mdi:file-document-outline",
                onClick: () => {
                  router.push("/dashboard/inspections/template");
                },
              }}
            />

            <ModuleSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by title, site, inspector..."
              aria-label="Search inspections"
            />

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
              />

              {selectedId !== null ? (
                detailSummaryQuery.isPending ? (
                  <InspectionDetailPanelSkeleton />
                ) : detailSummaryQuery.isError ? (
                  <p className="text-ehs-red text-sm">
                    {detailSummaryErrorMessage(detailSummaryQuery.error)}
                  </p>
                ) : detail ? (
                  <InspectionDetailPanel
                    detail={detail}
                    className="min-w-0"
                    onViewFindings={() =>
                      router.push(
                        `/dashboard/inspections/findings/${encodeURIComponent(selectedId)}`,
                      )
                    }
                  />
                ) : null
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
