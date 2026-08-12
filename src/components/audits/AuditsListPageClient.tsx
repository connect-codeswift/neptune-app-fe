"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Table } from "@/components/ui/Table";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import { auditColumns } from "@/components/audits/AuditColumns";
import { AuditDetailPanel } from "@/components/audits/AuditDetailPanel";
import {
  AuditDetailPanelSkeleton,
  AuditPageSkeleton,
} from "@/components/audits/AuditPageSkeleton";
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
import { MetricCardsRow } from "@/components/ui/MetricCard";
import { getCurrentUser } from "@/lib/current-user";

const PAGE_SIZE = 10;

export function AuditsListPageClient() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] =
    useState<RegisterStatusFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const { userId } = getCurrentUser();
  const summaryQuery = useAuditSummaryQuery(userId);

  const listParams = useMemo(
    () => ({
      pageNumber,
      pageSize: PAGE_SIZE,
      status: toApiStatusFilter(selectedStatus),
    }),
    [pageNumber, selectedStatus],
  );

  const auditsQuery = useAuditsQuery(listParams);

  const page = auditsQuery.data?.dataModel;
  const records = useMemo(
    () => (page?.data ?? []).map(mapAuditDtoToRecord),
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
        record.auditor,
        record.status,
        record.dueDate,
        record.findings ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [records, searchQuery]);

  const detailSummaryQuery = useAuditDetailSummaryQuery(selectedId);
  const detail = useMemo(() => {
    const dto = detailSummaryQuery.data?.dataModel;
    return dto ? mapAuditDetailSummaryToDetail(dto) : null;
  }, [detailSummaryQuery.data]);

  const metrics = useMemo(
    () => mapSummaryToMetrics(summaryQuery.data?.dataModel, "audit"),
    [summaryQuery.data],
  );

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader title="Audits" />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        {summaryQuery.isPending ? (
          <AuditPageSkeleton />
        ) : (
          <>
            <MetricCardsRow metrics={metrics} />

            {summaryQuery.isError ? (
              <p className="text-ehs-red text-sm">Could not load audit KPIs.</p>
            ) : null}
          </>
        )}

        {auditsQuery.isPending && !auditsQuery.data ? (
          <AuditPageSkeleton />
        ) : (
          <>
            {auditsQuery.isError ? (
              <p className="text-ehs-red text-sm">Could not load audits.</p>
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
                  router.push("/dashboard/audits/template");
                },
              }}
            />

            <ModuleSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by title, site, auditor..."
              aria-label="Search audits"
            />

            <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Table
                data={filteredRecords}
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
          </>
        )}
      </div>
    </div>
  );
}
