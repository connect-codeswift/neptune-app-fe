"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { IncidentListHeader } from "@/components/incidents/list/IncidentListHeader";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  DEFAULT_COMPLIANCES_PAGE_NUMBER,
  DEFAULT_COMPLIANCES_PAGE_SIZE,
  useComplianceCategoryStatsQuery,
  useComplianceDashboardKpisQuery,
  useComplianceUpcomingFilingsQuery,
  useCompliancesListQuery,
} from "@/hooks/use-compliance-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import {
  mapComplianceCategoryStatsToProgress,
  mapComplianceDashboardKpisToItems,
} from "@/services/mappers/compliance.mapper";
import { toast } from "@/lib/toast";
import type {
  ComplianceStatusType,
  JurisdictionType,
} from "./regulatory-compliance-types";
import { RegulatoryComplianceKpiGrid } from "./RegulatoryComplianceKpiGrid";
import { RegulatoryComplianceRegisterCard } from "./RegulatoryComplianceRegisterCard";
import { RegulatoryComplianceByCategoryCard } from "./RegulatoryComplianceByCategoryCard";
import { RegulatoryComplianceUpcomingFilingsCard } from "./RegulatoryComplianceUpcomingFilingsCard";

const SEARCH_DEBOUNCE_MS = 300;

function toApiStatusFilter(status: ComplianceStatusType): string {
  if (status === "All") {
    return "";
  }
  if (status === "Action") {
    return "Action required";
  }
  return status;
}

export function RegulatoryComplianceView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] =
    useState<JurisdictionType>("All");
  const [selectedStatus, setSelectedStatus] =
    useState<ComplianceStatusType>("All");
  const [pageNumber, setPageNumber] = useState(DEFAULT_COMPLIANCES_PAGE_NUMBER);
  const [pageSize] = useState(DEFAULT_COMPLIANCES_PAGE_SIZE);

  const accessTokenState = useHasAccessToken();
  const isClientReady = accessTokenState !== null;
  const hasToken = accessTokenState === true;
  const queryEnabled = isClientReady && hasToken;

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed === appliedSearch) {
      return;
    }

    const timer = window.setTimeout(() => {
      setAppliedSearch(trimmed);
      setPageNumber(DEFAULT_COMPLIANCES_PAGE_NUMBER);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchQuery, appliedSearch]);

  const kpisQuery = useComplianceDashboardKpisQuery(queryEnabled);
  const categoryStatsQuery = useComplianceCategoryStatsQuery(queryEnabled);
  const upcomingFilingsQuery = useComplianceUpcomingFilingsQuery(queryEnabled);
  const listQuery = useCompliancesListQuery({
    pageNumber,
    pageSize,
    search: appliedSearch,
    jurisdiction: selectedJurisdiction === "All" ? "" : selectedJurisdiction,
    status: toApiStatusFilter(selectedStatus),
    enabled: queryEnabled,
  });

  const kpiItems = useMemo(
    () => mapComplianceDashboardKpisToItems(kpisQuery.data?.dataModel),
    [kpisQuery.data],
  );

  const categoryItems = useMemo(
    () => mapComplianceCategoryStatsToProgress(categoryStatsQuery.data?.dataModel),
    [categoryStatsQuery.data],
  );

  const obligationItems = listQuery.data?.records ?? [];
  const totalCount = listQuery.data?.totalCount ?? 0;

  useEffect(() => {
    if (kpisQuery.isError) {
      toast.error(
        "Could not load dashboard KPIs",
        getMutationErrorMessage(
          kpisQuery.error,
          "Failed to load compliance dashboard metrics.",
        ),
      );
    }
  }, [kpisQuery.isError, kpisQuery.error]);

  useEffect(() => {
    if (categoryStatsQuery.isError) {
      toast.error(
        "Could not load category stats",
        getMutationErrorMessage(
          categoryStatsQuery.error,
          "Failed to load compliance category stats.",
        ),
      );
    }
  }, [categoryStatsQuery.isError, categoryStatsQuery.error]);

  useEffect(() => {
    if (listQuery.isError) {
      toast.error(
        "Could not load compliance register",
        getMutationErrorMessage(
          listQuery.error,
          "Failed to load compliance obligations.",
        ),
      );
    }
  }, [listQuery.isError, listQuery.error]);

  useEffect(() => {
    if (upcomingFilingsQuery.isError) {
      toast.error(
        "Could not load upcoming filings",
        getMutationErrorMessage(
          upcomingFilingsQuery.error,
          "Failed to load upcoming filings.",
        ),
      );
    }
  }, [upcomingFilingsQuery.isError, upcomingFilingsQuery.error]);

  const showKpiLoading =
    !isClientReady || (hasToken && kpisQuery.isLoading && !kpisQuery.data);

  const showCategoryLoading =
    !isClientReady ||
    (hasToken && categoryStatsQuery.isLoading && !categoryStatsQuery.data);

  const showUpcomingLoading =
    !isClientReady ||
    (hasToken && upcomingFilingsQuery.isLoading && !upcomingFilingsQuery.data);

  const showRegisterLoading =
    !isClientReady || (hasToken && listQuery.isLoading && !listQuery.data);

  return (
    <div className="bg-ehs-light-bg flex flex-1 flex-col gap-6 px-4">
      <IncidentListHeader
        title="Regularity Compliance"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications={true}
        showAction={false}
        className="px-0 py-0"
      />

      <RegulatoryComplianceKpiGrid
        items={kpiItems}
        isLoading={showKpiLoading}
      />

      <div className="flex items-center gap-2.5">
        <Link
          href="/dashboard/regulatory-compliance"
          className="bg-ehs-normal-blue text-ehs-light-text inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold shadow-xs transition-all"
        >
          <Icon
            icon="mdi:view-grid-outline"
            className="text-base"
            aria-hidden="true"
          />
          <span>List view</span>
        </Link>

        <Link
          href="/dashboard/regulatory-compliance/calendar"
          className="border-ehs-border text-ehs-dark-bg hover:bg-ehs-light-bg inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-[13px] font-bold shadow-xs transition-all"
        >
          <Icon
            icon="mdi:calendar-month-outline"
            className="text-ehs-normal-blue text-base"
            aria-hidden="true"
          />
          <span>Calendar view</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <RegulatoryComplianceRegisterCard
          items={obligationItems}
          selectedJurisdiction={selectedJurisdiction}
          selectedStatus={selectedStatus}
          onJurisdictionChange={(value) => {
            setSelectedJurisdiction(value);
            setPageNumber(DEFAULT_COMPLIANCES_PAGE_NUMBER);
          }}
          onStatusChange={(value) => {
            setSelectedStatus(value);
            setPageNumber(DEFAULT_COMPLIANCES_PAGE_NUMBER);
          }}
          isLoading={showRegisterLoading}
          pagination={{
            pageNumber,
            pageSize,
            totalRecords: totalCount,
            onPageChange: setPageNumber,
            isLoading: listQuery.isFetching,
          }}
        />

        <div className="flex flex-col gap-6">
          <RegulatoryComplianceByCategoryCard
            categories={categoryItems}
            isLoading={showCategoryLoading}
          />
          <RegulatoryComplianceUpcomingFilingsCard
            filings={upcomingFilingsQuery.data ?? []}
            isLoading={showUpcomingLoading}
          />
        </div>
      </div>
    </div>
  );
}
