"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useHazardKpiQuery,
  useHazardListQuery,
} from "@/hooks/use-hazard-queries";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { UnifiedNearMissAndHazardListPage } from "@/components/reporting/UnifiedNearMissAndHazardListPage";
import { HazardHeatmapCard } from "@/components/hazard/HazardHeatmapCard";
import { HazardRecognitionCard } from "@/components/hazard/HazardRecognitionCard";
import { makeHazardColumns } from "@/components/hazard/HazardColumns";
import {
  formatHazardDisplayId,
  mapHazardDtoToRecord,
  mapHazardKpiToMetrics,
} from "@/lib/map-hazard";
import { canViewHazardInsights, getCurrentUser } from "@/lib/current-user";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { toUserNameLookup, userNameFor } from "@/lib/map-user";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = ["All", "Open", "Investigating", "Closed"] as const;

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

  const columns = useMemo(
    () =>
      makeHazardColumns({
        userNames,
        onView: (record) => {
          router.push(`/dashboard/hazard/${encodeURIComponent(record.id)}`);
        },
      }),
    [router, userNames],
  );

  const metrics = useMemo(
    () => mapHazardKpiToMetrics(hazardKpiQuery.data?.dataModel),
    [hazardKpiQuery.data?.dataModel],
  );

  const isLoading =
    hazardListQuery.isPending || (canViewInsights && hazardKpiQuery.isPending);

  return (
    <UnifiedNearMissAndHazardListPage
      title="Hazard Reporting"
      isLoading={isLoading}
      canViewInsights={canViewInsights}
      metrics={metrics}
      statusOptions={STATUS_OPTIONS}
      selectedStatus={selectedStatus}
      onStatusChange={setSelectedStatus}
      reportActionLabel="Report Hazard"
      onReportClick={() => {
        router.push("/dashboard/hazard/report");
      }}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchAriaLabel="Search hazards"
      listError={
        hazardListQuery.isError
          ? getMutationErrorMessage(
              hazardListQuery.error,
              "Could not load hazards.",
            )
          : null
      }
      table={{
        data: filteredRecords,
        columns,
        getRowId: (row) => row.id,
        pagination: {
          pageNumber: page?.pageNumber ?? pageNumber,
          pageSize: page?.pageSize ?? PAGE_SIZE,
          totalRecords: page?.totalRecords ?? 0,
          onPageChange: setPageNumber,
          isLoading: hazardListQuery.isFetching,
        },
      }}
      insights={
        <>
          <HazardHeatmapCard />
          <HazardRecognitionCard />
        </>
      }
    />
  );
}
