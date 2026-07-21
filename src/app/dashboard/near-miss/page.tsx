"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useNearMissListQuery } from "@/hooks/use-near-miss-queries";
import { useDeleteNearMissMutation } from "@/hooks/use-near-miss-mutations";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  StatMetricCard,
  type StatMetricCardProps,
} from "@/components/StatMetricCard";
import { Table } from "@/components/ui/Table";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { NearMissFilterBar } from "@/components/near-miss/NearMissFilterBar";
import { NearMissHeatmapCard } from "@/components/near-miss/NearMissHeatmapCard";
import { NearMissRecognitionCard } from "@/components/near-miss/NearMissRecognitionCard";
import { NearMissPageSkeleton } from "@/components/near-miss/NearMissPageSkeleton";
import { makeNearMissColumns } from "@/components/near-miss/NearMissColumns";
import {
  mapNearMissDtoToRecord,
  formatNearMissDisplayId,
} from "@/lib/map-near-miss";
import { toast } from "@/lib/toast";
import type { NearMissRecord } from "./near-miss-data";

const PAGE_SIZE = 10;

export default function NearMissPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<NearMissRecord | null>(
    null,
  );

  const [pageNumber, setPageNumber] = useState(1);

  const nearMissListQuery = useNearMissListQuery({
    pageNumber,
    pageSize: PAGE_SIZE,
  });

  const deleteMutation = useDeleteNearMissMutation();

  const page = nearMissListQuery.data?.dataModel;
  const records = useMemo(
    () => (page?.data ?? []).map(mapNearMissDtoToRecord),
    [page],
  );
  const NEAR_MISS_METRICS: readonly StatMetricCardProps[] = [
    {
      title: "Total near misses",
      value: page?.totalRecords ?? 0,
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
  // Filter records by stage and site before passing to the table
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesStatus =
        selectedStatus === "All" || record.status === selectedStatus;
      return matchesStatus;
    });
  }, [records, selectedStatus]);

  const columns = useMemo(
    () =>
      makeNearMissColumns({
        onDelete: setRecordToDelete,
        deletingId: deleteMutation.isPending
          ? (deleteMutation.variables ?? null)
          : null,
      }),
    [deleteMutation.isPending, deleteMutation.variables],
  );

  const handleReportNearMiss = () => {
    router.push("/dashboard/near-miss/report");
  };

  const handleConfirmDelete = () => {
    if (!recordToDelete) return;

    deleteMutation.mutate(recordToDelete.id, {
      onSuccess: () => {
        toast.success(`${formatNearMissDisplayId(recordToDelete.id)} deleted`);
        setRecordToDelete(null);
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not delete the near miss. Please try again.",
          ),
        );
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-5">
      <DashboardHeader
        title="Near Miss Reporting"
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      {nearMissListQuery.isPending ? (
        <NearMissPageSkeleton />
      ) : (
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
            <div className="flex min-w-0 flex-col gap-2">
              {nearMissListQuery.isError && (
                <p className="text-ehs-red text-sm">
                  {getMutationErrorMessage(
                    nearMissListQuery.error,
                    "Could not load near misses.",
                  )}
                </p>
              )}

              <Table
                data={filteredRecords}
                columns={columns}
                selectedRowId={selectedId}
                onRowClick={(row) =>
                  router.push(
                    `/dashboard/near-miss/${encodeURIComponent(row.id)}`,
                  )
                }
                getRowId={(row) => row.id}
                containerClassName="min-w-0 shadow-sm"
                pagination={{
                  pageNumber: page?.pageNumber ?? pageNumber,
                  pageSize: page?.pageSize ?? PAGE_SIZE,
                  totalRecords: page?.totalRecords ?? 0,
                  onPageChange: setPageNumber,
                  isLoading: nearMissListQuery.isFetching,
                }}
              />
            </div>

            <div className="flex min-w-0 flex-col gap-5">
              <NearMissHeatmapCard />
              <NearMissRecognitionCard />
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={recordToDelete !== null}
        title="Delete near miss?"
        description={
          recordToDelete
            ? `${formatNearMissDisplayId(recordToDelete.id)} will be permanently removed. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deleteMutation.isPending) setRecordToDelete(null);
        }}
      />
    </div>
  );
}
