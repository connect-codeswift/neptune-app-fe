"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useNearMissListQuery } from "@/hooks/use-near-miss-queries";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Table } from "@/components/ui/Table";
import { NearMissFilterBar } from "@/components/near-miss/NearMissFilterBar";
import { NearMissPageSkeleton } from "@/components/near-miss/NearMissPageSkeleton";
import { makeNearMissColumns } from "@/components/near-miss/NearMissColumns";
import { NearMissViewTabs } from "@/components/near-miss/NearMissViewTabs";
import { mapNearMissDtoToRecord } from "@/lib/map-near-miss";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { toUserNameLookup } from "@/lib/map-user";

const PAGE_SIZE = 10;

export function NearMissListPageClient() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [pageNumber, setPageNumber] = useState(1);

  const nearMissListQuery = useNearMissListQuery({
    pageNumber,
    pageSize: PAGE_SIZE,
  });

  const userDropdownQuery = useUserDropdownQuery();
  const users = userDropdownQuery.data?.dataModel;
  const userNames = useMemo(() => toUserNameLookup(users ?? []), [users]);
  const page = nearMissListQuery.data?.dataModel;
  const records = useMemo(
    () => (page?.data ?? []).map(mapNearMissDtoToRecord),
    [page],
  );

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      return selectedStatus === "All" || record.status === selectedStatus;
    });
  }, [records, selectedStatus]);

  const columns = useMemo(
    () => makeNearMissColumns({ userNames }),
    [userNames],
  );

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader title="Near Miss Reporting" />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        <NearMissViewTabs />

        {nearMissListQuery.isPending ? (
          <NearMissPageSkeleton />
        ) : (
          <>
            <NearMissFilterBar
              status={selectedStatus}
              onStatusChange={(status) => {
                setSelectedStatus(status);
              }}
              onReportNearMiss={() => {
                router.push("/dashboard/near-miss/report");
              }}
            />

            <div className="flex min-w-0 flex-col gap-2">
              {nearMissListQuery.isError ? (
                <p className="text-ehs-red text-sm">
                  {getMutationErrorMessage(
                    nearMissListQuery.error,
                    "Could not load near misses.",
                  )}
                </p>
              ) : null}

              <Table
                data={filteredRecords}
                columns={columns}
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
          </>
        )}
      </div>
    </div>
  );
}
