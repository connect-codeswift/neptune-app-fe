"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Table } from "@/components/ui/Table";
import { inspectionColumns } from "@/components/inspections/InspectionColumns";
import { InspectionDetailPanel } from "@/components/inspections/InspectionDetailPanel";
import {
  InspectionDetailPanelSkeleton,
  InspectionPageSkeleton,
} from "@/components/inspections/InspectionPageSkeleton";
import { InspectionRegisterToolbar } from "@/components/inspections/InspectionRegisterToolbar";
import { InspectionsViewTabs } from "@/components/inspections/InspectionsViewTabs";
import {
  useInspectionDetailSummaryQuery,
  useInspectionsQuery,
} from "@/hooks/use-inspection-queries";
import { mapInspectionDtoToRecord } from "@/lib/map-inspection";
import { mapInspectionDetailSummaryToDetail } from "@/lib/map-audit-inspection-dashboard";
import {
  REGISTER_STATUS_FILTERS,
  toApiStatusFilter,
  type RegisterStatusFilter,
} from "@/lib/audit-inspection-status";
import { detailSummaryErrorMessage } from "@/lib/audit-inspection-errors";

const PAGE_SIZE = 10;

export function InspectionsListPageClient() {
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

  const inspectionsQuery = useInspectionsQuery(listParams);

  const page = inspectionsQuery.data?.dataModel;
  const records = useMemo(
    () => (page?.data ?? []).map(mapInspectionDtoToRecord),
    [page],
  );

  const detailSummaryQuery = useInspectionDetailSummaryQuery(selectedId);
  const detail = useMemo(() => {
    const dto = detailSummaryQuery.data?.dataModel;
    return dto ? mapInspectionDetailSummaryToDetail(dto) : null;
  }, [detailSummaryQuery.data]);

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader title="Inspections" />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        <InspectionsViewTabs />

        {inspectionsQuery.isPending && !inspectionsQuery.data ? (
          <InspectionPageSkeleton />
        ) : (
          <>
            {inspectionsQuery.isError ? (
              <p className="text-ehs-red text-sm">Could not load inspections.</p>
            ) : null}

            <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Table
                data={records}
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
                    status={selectedStatus}
                    statuses={REGISTER_STATUS_FILTERS}
                    onStatusChange={(value) => {
                      setSelectedStatus(value as RegisterStatusFilter);
                      setPageNumber(1);
                    }}
                    onTemplatesClick={() =>
                      router.push("/dashboard/inspections/template")
                    }
                  />
                }
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
