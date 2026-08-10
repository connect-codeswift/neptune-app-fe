"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useNearMissKpiQuery,
  useNearMissListQuery,
} from "@/hooks/use-near-miss-queries";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatMetricCard } from "@/components/StatMetricCard";
import { Table } from "@/components/ui/Table";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import { NearMissHeatmapCard } from "@/components/near-miss/NearMissHeatmapCard";
import { NearMissRecognitionCard } from "@/components/near-miss/NearMissRecognitionCard";
import { NearMissPageSkeleton } from "@/components/near-miss/NearMissPageSkeleton";
import { makeNearMissColumns } from "@/components/near-miss/NearMissColumns";
import {
  formatNearMissDisplayId,
  mapNearMissDtoToRecord,
  mapNearMissKpiToMetrics,
  normalizeNearMissKpiDto,
} from "@/lib/map-near-miss";
import { canViewNearMissInsights } from "@/lib/current-user";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { toUserNameLookup, userNameFor } from "@/lib/map-user";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  "All",
  "Open",
  "Investigating",
  "Closed",
] as const;

export function NearMissListPageClient() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [canViewInsights, setCanViewInsights] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time role read from localStorage token
    setCanViewInsights(canViewNearMissInsights());
  }, []);

  const nearMissListQuery = useNearMissListQuery({
    pageNumber,
    pageSize: PAGE_SIZE,
  });
  const nearMissKpiQuery = useNearMissKpiQuery(canViewInsights);

  const userDropdownQuery = useUserDropdownQuery();
  const users = userDropdownQuery.data?.dataModel;
  const userNames = useMemo(() => toUserNameLookup(users ?? []), [users]);
  const page = nearMissListQuery.data?.dataModel;
  const records = useMemo(
    () => (page?.data ?? []).map(mapNearMissDtoToRecord),
    [page],
  );

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return records.filter((record) => {
      if (selectedStatus !== "All" && record.status !== selectedStatus) {
        return false;
      }
      if (!query) return true;

      const haystack = [
        formatNearMissDisplayId(record.id),
        record.id,
        record.title,
        record.description,
        record.location,
        record.site,
        record.hazardType,
        record.reporterId != null
          ? userNameFor(userNames, record.reporterId)
          : record.reporter,
        record.status,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [records, searchQuery, selectedStatus, userNames]);

  const columns = useMemo(
    () => makeNearMissColumns({ userNames }),
    [userNames],
  );

  const metrics = useMemo(
    () =>
      mapNearMissKpiToMetrics(
        normalizeNearMissKpiDto(nearMissKpiQuery.data?.dataModel),
      ),
    [nearMissKpiQuery.data?.dataModel],
  );

  const isLoading =
    nearMissListQuery.isPending ||
    (canViewInsights && nearMissKpiQuery.isPending);

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader title="Near Miss Reporting" />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        {isLoading ? (
          <NearMissPageSkeleton />
        ) : (
          <>
            {canViewInsights ? (
              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                {metrics.map((metric) => (
                  <StatMetricCard key={metric.title} {...metric} />
                ))}
              </div>
            ) : null}

            <ModuleFilterBar
              segments={[
                {
                  label: "Status",
                  options: STATUS_OPTIONS,
                  value: selectedStatus,
                  onChange: setSelectedStatus,
                },
              ]}
              action={{
                label: "Report Near Miss",
                onClick: () => {
                  router.push("/dashboard/near-miss/report");
                },
              }}
            />

            <ModuleSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by title, location, reporter..."
              aria-label="Search near misses"
            />

            <div
              className={[
                "grid min-w-0 items-start gap-5",
                canViewInsights ? "xl:grid-cols-[1fr_460px]" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
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

              {canViewInsights ? (
                <div className="flex min-w-0 flex-col gap-5">
                  <NearMissHeatmapCard />
                  <NearMissRecognitionCard />
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
