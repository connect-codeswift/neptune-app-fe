"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Table } from "@/components/ui/Table";
import { auditColumns } from "@/components/audits/AuditColumns";
import { AuditDetailPanel } from "@/components/audits/AuditDetailPanel";
import {
  AuditDetailPanelSkeleton,
  AuditPageSkeleton,
} from "@/components/audits/AuditPageSkeleton";
import { AuditRegisterToolbar } from "@/components/audits/AuditRegisterToolbar";
import { AuditsViewTabs } from "@/components/audits/AuditsViewTabs";
import {
  useAuditDetailSummaryQuery,
  useAuditsQuery,
} from "@/hooks/use-audit-queries";
import { mapAuditDtoToRecord } from "@/lib/map-audit";
import { mapAuditDetailSummaryToDetail } from "@/lib/map-audit-inspection-dashboard";
import {
  REGISTER_STATUS_FILTERS,
  toApiStatusFilter,
  type RegisterStatusFilter,
} from "@/lib/audit-inspection-status";
import { detailSummaryErrorMessage } from "@/lib/audit-inspection-errors";

const PAGE_SIZE = 10;

export function AuditsListPageClient() {
  const router = useRouter();
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

  const auditsQuery = useAuditsQuery(listParams);

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

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader title="Audits" />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        <AuditsViewTabs />

        {auditsQuery.isPending && !auditsQuery.data ? (
          <AuditPageSkeleton />
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
