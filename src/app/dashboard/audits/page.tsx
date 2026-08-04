"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  useAuditDetailSummaryQuery,
  useAuditsQuery,
  useAuditSummaryQuery,
} from "@/hooks/use-audit-queries";
import { mapAuditDtoToRecord } from "@/lib/map-audit";
import {
  mapAuditDetailSummaryToDetail,
  mapSummaryToMetrics,
} from "@/lib/map-audit-inspection-dashboard";
import {
  REGISTER_STATUS_FILTERS,
  toApiStatusFilter,
  type RegisterStatusFilter,
} from "@/lib/audit-inspection-status";
import { detailSummaryErrorMessage } from "@/lib/audit-inspection-errors";
import { getCurrentUser } from "@/lib/current-user";
import { StatMetricCard } from "@/components/StatMetricCard";
import { Table } from "@/components/ui/Table";
import { auditColumns } from "@/components/audits/AuditColumns";
import { AuditDetailPanel } from "@/components/audits/AuditDetailPanel";
import {
  AuditDetailPanelSkeleton,
  AuditPageSkeleton,
} from "@/components/audits/AuditPageSkeleton";
import { AuditRegisterToolbar } from "@/components/audits/AuditRegisterToolbar";

const PAGE_SIZE = 10;

export default function AuditsPage() {
  const router = useRouter();
  const { userId } = getCurrentUser();
  const [selectedStatus, setSelectedStatus] =
    useState<RegisterStatusFilter>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const listParams = useMemo(
    () => ({
      pageNumber,
      pageSize: PAGE_SIZE,
      status: toApiStatusFilter(selectedStatus),
    }),
    [pageNumber, selectedStatus],
  );

  const summaryQuery = useAuditSummaryQuery(userId);
  const auditsQuery = useAuditsQuery(listParams);

  const metrics = useMemo(
    () => mapSummaryToMetrics(summaryQuery.data?.dataModel, "audit"),
    [summaryQuery.data],
  );

  const page = auditsQuery.data?.dataModel;
  const records = useMemo(
    () => (page?.data ?? []).map(mapAuditDtoToRecord),
    [page],
  );

  const detailSummaryQuery = useAuditDetailSummaryQuery(selectedId);
  const detail = useMemo(() => {
    const dto = detailSummaryQuery.data?.dataModel;
    return dto ? mapAuditDetailSummaryToDetail(dto) : null;
  }, [detailSummaryQuery.data]);

  const isInitialLoading = summaryQuery.isPending && auditsQuery.isPending;

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader
        title="Audits"
        searchPlaceholder="Search incidents, actions, docs..."
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />
      {isInitialLoading ? (
        <AuditPageSkeleton />
      ) : (
        <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <StatMetricCard key={metric.title} {...metric} />
            ))}
          </div>

          {summaryQuery.isError ? (
            <p className="text-ehs-red text-sm">Could not load audit KPIs.</p>
          ) : null}

          {auditsQuery.isError ? (
            <p className="text-ehs-red text-sm">Could not load audits.</p>
          ) : null}

          <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Table
              data={records}
              columns={auditColumns}
              selectedRowId={selectedId}
              onRowClick={(row) => setSelectedId(row.id)}
              getRowId={(row) => row.id}
              containerClassName="min-w-0"
              pagination={{
                pageNumber,
                pageSize: PAGE_SIZE,
                totalRecords: page?.totalRecords ?? 0,
                onPageChange: setPageNumber,
                isLoading: auditsQuery.isFetching,
              }}
              header={
                <AuditRegisterToolbar
                  status={selectedStatus}
                  statuses={REGISTER_STATUS_FILTERS}
                  onStatusChange={(value) => {
                    setSelectedStatus(value as RegisterStatusFilter);
                    setPageNumber(1);
                  }}
                  onTemplatesClick={() =>
                    router.push("/dashboard/audits/template")
                  }
                />
              }
            />

            {selectedId !== null ? (
              detailSummaryQuery.isPending ? (
                <AuditDetailPanelSkeleton />
              ) : detailSummaryQuery.isError ? (
                <p className="text-ehs-red text-sm">
                  {detailSummaryErrorMessage(detailSummaryQuery.error)}
                </p>
              ) : detail ? (
                <AuditDetailPanel
                  detail={detail}
                  className="min-w-0"
                  onViewFindings={() =>
                    router.push(
                      `/dashboard/audits/findings/${encodeURIComponent(selectedId)}`,
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
