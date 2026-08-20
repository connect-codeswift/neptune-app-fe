"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useNearMissKpiQuery,
  useNearMissListQuery,
} from "@/hooks/use-near-miss-queries";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { UnifiedNearMissAndHazardListPage } from "@/components/reporting/UnifiedNearMissAndHazardListPage";
import { NearMissHeatmapCard } from "@/components/near-miss/NearMissHeatmapCard";
import { NearMissRecognitionCard } from "@/components/near-miss/NearMissRecognitionCard";
import { NearMissDetailPanel } from "@/components/near-miss/NearMissDetailPanel";
import { makeNearMissColumns } from "@/components/near-miss/NearMissColumns";
import { withManageAction } from "@/components/ui/table-manage-column";
import type { NearMissRecord } from "@/app/dashboard/near-miss/near-miss-data";
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

const STATUS_OPTIONS = ["All", "Open", "Investigating", "Closed"] as const;

export function NearMissListPageClient() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  const selectedRecord =
    selectedId == null
      ? null
      : (filteredRecords.find((record) => record.id === selectedId) ??
        records.find((record) => record.id === selectedId) ??
        null);
  const activeSelectedId = selectedRecord?.id ?? null;

  const columns = useMemo(
    () =>
      withManageAction<NearMissRecord>(
        makeNearMissColumns({
          userNames,
          selectedId: activeSelectedId,
          onView: (record) => {
            setSelectedId((current) =>
              current === record.id ? null : record.id,
            );
          },
        }),
        {
          getHref: (record) =>
            `/dashboard/near-miss/${encodeURIComponent(record.id)}`,
          getAriaLabel: (record) =>
            `Manage near miss ${formatNearMissDisplayId(record.id)}`,
        },
      ),
    [userNames, activeSelectedId],
  );

  const metrics = useMemo(
    () =>
      mapNearMissKpiToMetrics(
        normalizeNearMissKpiDto(nearMissKpiQuery.data?.dataModel),
      ),
    [nearMissKpiQuery.data?.dataModel],
  );

  const isLoading = canViewInsights && nearMissKpiQuery.isPending;
  const isTableLoading =
    nearMissListQuery.isPending ||
    (nearMissListQuery.isFetching && nearMissListQuery.data === undefined);
  const resultLabel = `${String(filteredRecords.length)} ${
    filteredRecords.length === 1 ? "near miss" : "near misses"
  }`;

  return (
    <UnifiedNearMissAndHazardListPage
      title="Near Miss Reporting"
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
      reportActionLabel="Report Near Miss"
      onReportClick={() => {
        router.push("/dashboard/near-miss/report");
      }}
      searchQuery={searchQuery}
      onSearchChange={(query) => {
        setSearchQuery(query);
        setPageNumber(1);
        setSelectedId(null);
      }}
      searchAriaLabel="Search near misses"
      resultLabel={resultLabel}
      itemNoun="near miss"
      itemNounPlural="near misses"
      registerCount={page?.totalRecords ?? filteredRecords.length}
      listError={
        nearMissListQuery.isError
          ? getMutationErrorMessage(
              nearMissListQuery.error,
              "Could not load near misses.",
            )
          : null
      }
      onRetry={() => {
        void nearMissListQuery.refetch();
      }}
      table={{
        data: filteredRecords,
        columns,
        getRowId: (row) => row.id,
        selectedRowId: activeSelectedId,
        pagination: {
          pageNumber: page?.pageNumber ?? pageNumber,
          pageSize: page?.pageSize ?? PAGE_SIZE,
          totalRecords: page?.totalRecords ?? 0,
          onPageChange: (nextPage) => {
            setPageNumber(nextPage);
            setSelectedId(null);
          },
          isLoading: nearMissListQuery.isFetching,
        },
      }}
      detailPanel={
        selectedRecord ? (
          <NearMissDetailPanel
            record={selectedRecord}
            userNames={userNames}
            className="min-w-0 xl:sticky xl:top-4"
          />
        ) : null
      }
      insights={
        <>
          <NearMissHeatmapCard />
          <NearMissRecognitionCard />
        </>
      }
    />
  );
}
