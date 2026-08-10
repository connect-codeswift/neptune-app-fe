"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Table } from "@/components/ui/Table";
import { FIELD_INPUT_LG_CLASS } from "@/components/ui/field-styles";
import { StatMetricCard } from "@/components/StatMetricCard";
import { inspectionColumns } from "@/components/inspections/InspectionColumns";
import { InspectionDetailPanel } from "@/components/inspections/InspectionDetailPanel";
import {
  InspectionDetailPanelSkeleton,
  InspectionPageSkeleton,
} from "@/components/inspections/InspectionPageSkeleton";
import { InspectionFilterBar } from "@/components/inspections/InspectionFilterBar";
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

            <InspectionFilterBar
              status={selectedStatus}
              onStatusChange={(value) => {
                setSelectedStatus(value as RegisterStatusFilter);
                setPageNumber(1);
              }}
              onTemplatesClick={() =>
                router.push("/dashboard/inspections/template")
              }
            />

            <div className="relative w-full max-w-md min-w-0">
              <Icon
                icon="mdi:magnify"
                className="text-ehs-muted-text pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                }}
                placeholder="Search by title, site, inspector..."
                aria-label="Search inspections"
                className={`${FIELD_INPUT_LG_CLASS} pl-9`}
              />
            </div>

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
