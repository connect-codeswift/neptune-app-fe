"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Table } from "@/components/ui/Table";
import { HazardFilterBar } from "@/components/hazard/HazardFilterBar";
import { makeHazardColumns } from "@/components/hazard/HazardColumns";
import { HazardPageSkeleton } from "@/components/hazard/HazardPageSkeleton";
import { HazardViewTabs } from "@/components/hazard/HazardViewTabs";
import { useHazardListQuery } from "@/hooks/use-hazard-queries";
import { getCurrentUser } from "@/lib/current-user";
import { mapHazardDtoToRecord } from "@/lib/map-hazard";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { toUserNameLookup } from "@/lib/map-user";

const PAGE_SIZE = 10;

export function HazardListPageClient() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [pageNumber, setPageNumber] = useState(1);

  const { userId, siteId } = getCurrentUser();
  const hazardListQuery = useHazardListQuery({
    pageNumber,
    pageSize: PAGE_SIZE,
    siteId,
    userId,
  });

  const userDropdownQuery = useUserDropdownQuery();
  const users = userDropdownQuery.data?.dataModel;
  const userNames = useMemo(() => toUserNameLookup(users ?? []), [users]);

  const page = hazardListQuery.data?.dataModel;
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

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-2">
      <DashboardHeader title="Hazard Reporting" />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        <HazardViewTabs />

        {hazardListQuery.isPending ? (
          <HazardPageSkeleton />
        ) : (
          <>
            <HazardFilterBar
              status={selectedStatus}
              onStatusChange={setSelectedStatus}
              onReportHazard={() => {
                router.push("/dashboard/hazard/report");
              }}
            />

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
          </>
        )}
      </div>
    </div>
  );
}
