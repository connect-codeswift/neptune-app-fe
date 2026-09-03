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
import { HazardDetailPanel } from "@/components/hazard/HazardDetailPanel";
import { makeHazardColumns } from "@/components/hazard/HazardColumns";
import { withRowLink } from "@/components/ui/table-row-link";
import type { HazardRecord } from "@/app/dashboard/hazard/hazard-data";
import {
  formatHazardDisplayId,
  mapHazardDtoToRecord,
  mapHazardKpiToMetrics,
} from "@/lib/map-hazard";
import { canViewHazardInsights, getCurrentUser } from "@/lib/current-user";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { toUserNameLookup, userNameFor } from "@/lib/map-user";

/** Where a row in this register opens. Shared by the id link and the row click. */
const hazardRecordHref = (id: string) =>
  `/dashboard/hazard/${encodeURIComponent(id)}`;

const PAGE_SIZE = 10;

const STATUS_OPTIONS = ["All", "Open", "Investigating", "Closed"] as const;

export function HazardListPageClient() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
  const hazardKpiQuery = useHazardKpiQuery(canViewInsights);

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

  const selectedRecord =
    selectedId == null
      ? null
      : (filteredRecords.find((record) => record.id === selectedId) ??
        records.find((record) => record.id === selectedId) ??
        null);
  const activeSelectedId = selectedRecord?.id ?? null;

  const columns = useMemo(
    () =>
      withRowLink<HazardRecord>(
        makeHazardColumns({
          userNames,
          selectedId: activeSelectedId,
          onView: (record) => {
            setSelectedId((current) =>
              current === record.id ? null : record.id,
            );
          },
        }),
        {
          getHref: (record) => hazardRecordHref(record.id),
          getAriaLabel: (record) =>
            `Open hazard ${formatHazardDisplayId(record.id)}`,
        },
      ),
    [userNames, activeSelectedId],
  );

  const metrics = useMemo(
    () => mapHazardKpiToMetrics(hazardKpiQuery.data?.dataModel),
    [hazardKpiQuery.data?.dataModel],
  );

  const isLoading = canViewInsights && hazardKpiQuery.isPending;
  const isTableLoading =
    hazardListQuery.isPending ||
    (hazardListQuery.isFetching && hazardListQuery.data === undefined);
  const resultLabel = `${String(filteredRecords.length)} ${
    filteredRecords.length === 1 ? "hazard" : "hazards"
  }`;

  return (
    <UnifiedNearMissAndHazardListPage
      title="Hazard Reporting"
      isLoading={isLoading}
      isTableLoading={isTableLoading}
      canViewInsights={canViewInsights}
      metrics={metrics}
      statusOptions={STATUS_OPTIONS}
      selectedStatus={selectedStatus}
      onStatusChange={(status) => {
        setSelectedStatus(status);
        setPageNumber(1);
        setSelectedId(null);
      }}
      reportActionLabel="Report Hazard"
      onReportClick={() => {
        router.push("/dashboard/hazard/report");
      }}
      searchQuery={searchQuery}
      onSearchChange={(query) => {
        setSearchQuery(query);
        setPageNumber(1);
        setSelectedId(null);
      }}
      searchAriaLabel="Search hazards"
      resultLabel={resultLabel}
      itemNoun="hazard"
      itemNounPlural="hazards"
      registerCount={page?.totalRecords ?? filteredRecords.length}
      listError={
        hazardListQuery.isError
          ? getMutationErrorMessage(
              hazardListQuery.error,
              "Could not load hazards.",
            )
          : null
      }
      onRetry={() => {
        void hazardListQuery.refetch();
      }}
      table={{
        data: filteredRecords,
        columns,
        getRowId: (row) => row.id,
        rowHref: (row) => hazardRecordHref(row.id),
        selectedRowId: activeSelectedId,
        pagination: {
          pageNumber: page?.pageNumber ?? pageNumber,
          pageSize: page?.pageSize ?? PAGE_SIZE,
          totalRecords: page?.totalRecords ?? 0,
          onPageChange: (nextPage) => {
            setPageNumber(nextPage);
            setSelectedId(null);
          },
          isLoading: hazardListQuery.isFetching,
        },
      }}
      detailPanel={
        selectedRecord ? (
          <HazardDetailPanel
            record={selectedRecord}
            userNames={userNames}
            className="min-w-0 xl:sticky xl:top-4"
          />
        ) : null
      }
      insights={
        <>
          <HazardHeatmapCard />
          <HazardRecognitionCard />
        </>
      }
    />
  );
}
