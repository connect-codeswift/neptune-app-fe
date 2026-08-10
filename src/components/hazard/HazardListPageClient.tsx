"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useHazardKpiQuery,
  useHazardListQuery,
} from "@/hooks/use-hazard-queries";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatMetricCard } from "@/components/StatMetricCard";
import { Table } from "@/components/ui/Table";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import { HazardHeatmapCard } from "@/components/hazard/HazardHeatmapCard";
import { HazardRecognitionCard } from "@/components/hazard/HazardRecognitionCard";
import { makeHazardColumns } from "@/components/hazard/HazardColumns";
import { HazardPageSkeleton } from "@/components/hazard/HazardPageSkeleton";
import {
  formatHazardDisplayId,
  mapHazardDtoToRecord,
  mapHazardKpiToMetrics,
} from "@/lib/map-hazard";
import { canViewHazardInsights, getCurrentUser } from "@/lib/current-user";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { toUserNameLookup, userNameFor } from "@/lib/map-user";

const PAGE_SIZE = 10;

const HAZARD_STATUS_OPTIONS = [
  "All",
  "Open",
  "Investigating",
  "Closed",
] as const;

export function HazardListPageClient() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [canViewInsights, setCanViewInsights] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time role read from localStorage token
    setCanViewInsights(canViewHazardInsights());
  }, []);

  const { userId, siteId } = getCurrentUser();
  const hazardListQuery = useHazardListQuery({
    pageNumber,
    pageSize: PAGE_SIZE,
    siteId,
    userId,
  });
  const hazardKpiQuery = useHazardKpiQuery({ userId }, canViewInsights);

  const userDropdownQuery = useUserDropdownQuery();
  const users = userDropdownQuery.data?.dataModel;
  const userNames = useMemo(() => toUserNameLookup(users ?? []), [users]);

  const page = hazardListQuery.data?.dataModel;
  const records = useMemo(
    () => (page?.data ?? []).map(mapHazardDtoToRecord),
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
        formatHazardDisplayId(record.id),
        record.id,
        record.title,
        record.description,
        record.location,
        record.site,
        record.hazardType,
        record.severity,
        record.status,
        record.reporterId != null
          ? userNameFor(userNames, record.reporterId)
          : record.reporter,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [records, searchQuery, selectedStatus, userNames]);

  const columns = useMemo(() => makeHazardColumns({ userNames }), [userNames]);

  const metrics = useMemo(
    () => mapHazardKpiToMetrics(hazardKpiQuery.data?.dataModel),
    [hazardKpiQuery.data?.dataModel],
  );

  const isLoading =
    hazardListQuery.isPending ||
    (canViewInsights && hazardKpiQuery.isPending);

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader title="Hazard Reporting" />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        {isLoading ? (
          <HazardPageSkeleton />
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
                  options: HAZARD_STATUS_OPTIONS,
                  value: selectedStatus,
                  onChange: setSelectedStatus,
                },
              ]}
              action={{
                label: "Report Hazard",
                onClick: () => {
                  router.push("/dashboard/hazard/report");
                },
              }}
            />

            <ModuleSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by title, location, reporter..."
              aria-label="Search hazards"
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
                {hazardListQuery.isError ? (
                  <p className="text-ehs-red text-sm">
                    {getMutationErrorMessage(
                      hazardListQuery.error,
                      "Could not load hazards.",
                    )}
                  </p>
                ) : null}

                <Table
                  data={filteredRecords}
                  columns={columns}
                  onRowClick={(row) =>
                    router.push(
                      `/dashboard/hazard/${encodeURIComponent(row.id)}`,
                    )
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
              </div>

              {canViewInsights ? (
                <div className="flex min-w-0 flex-col gap-5">
                  <HazardHeatmapCard />
                  <HazardRecognitionCard />
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
