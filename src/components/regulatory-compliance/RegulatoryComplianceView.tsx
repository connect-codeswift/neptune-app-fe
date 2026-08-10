"use client";

import { useEffect, useMemo, useState } from "react";
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
import { CompliancePageHeader } from "./CompliancePageHeader";
import { RegulatoryComplianceKpiGrid } from "./RegulatoryComplianceKpiGrid";
import { RegulatoryComplianceRegisterCard } from "./RegulatoryComplianceRegisterCard";
import { RegulatoryComplianceByCategoryCard } from "./RegulatoryComplianceByCategoryCard";
import { RegulatoryComplianceUpcomingFilingsCard } from "./RegulatoryComplianceUpcomingFilingsCard";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";

const SEARCH_DEBOUNCE_MS = 300;

const JURISDICTION_OPTIONS: readonly JurisdictionType[] = [
  "All",
  "Federal",
  "State",
  "Local",
];

const STATUS_OPTIONS: readonly ComplianceStatusType[] = [
  "All",
  "Compliant",
  "Due soon",
  "Action required",
  "Upcoming",
];

function toApiStatusFilter(status: ComplianceStatusType): string {
  return status === "All" ? "" : status;
}

export function RegulatoryComplianceView() {
  const [registerSearchQuery, setRegisterSearchQuery] = useState("");
  const [appliedRegisterSearch, setAppliedRegisterSearch] = useState("");
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
    const trimmed = registerSearchQuery.trim();
    if (trimmed === appliedRegisterSearch) {
      return;
    }

    const timer = window.setTimeout(() => {
      setAppliedRegisterSearch(trimmed);
      setPageNumber(DEFAULT_COMPLIANCES_PAGE_NUMBER);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [registerSearchQuery, appliedRegisterSearch]);

  const kpisQuery = useComplianceDashboardKpisQuery(queryEnabled);
  const categoryStatsQuery = useComplianceCategoryStatsQuery(queryEnabled);
  const upcomingFilingsQuery = useComplianceUpcomingFilingsQuery(queryEnabled);
  const listQuery = useCompliancesListQuery({
    pageNumber,
    pageSize,
    search: appliedRegisterSearch,
    jurisdiction: selectedJurisdiction === "All" ? "" : selectedJurisdiction,
    status: toApiStatusFilter(selectedStatus),
    enabled: queryEnabled,
  });

  const kpiItems = useMemo(
    () => mapComplianceDashboardKpisToItems(kpisQuery.data?.dataModel),
    [kpisQuery.data],
  );

  const categoryItems = useMemo(
    () =>
      mapComplianceCategoryStatsToProgress(categoryStatsQuery.data?.dataModel),
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
    <div className="bg-ehs-light-bg flex flex-1 flex-col px-4 pb-6">
      <CompliancePageHeader />

      <RegulatoryComplianceKpiGrid
        items={kpiItems}
        isLoading={showKpiLoading}
        className="pt-4"
      />

      <div className="mt-4 flex flex-col gap-3.5">
        <ModuleFilterBar
          segments={[
            {
              label: "Jurisdiction",
              options: JURISDICTION_OPTIONS,
              value: selectedJurisdiction,
              onChange: (value) => {
                setSelectedJurisdiction(value as JurisdictionType);
                setPageNumber(DEFAULT_COMPLIANCES_PAGE_NUMBER);
              },
            },
            {
              label: "Status",
              options: STATUS_OPTIONS,
              value: selectedStatus,
              onChange: (value) => {
                setSelectedStatus(value as ComplianceStatusType);
                setPageNumber(DEFAULT_COMPLIANCES_PAGE_NUMBER);
              },
            },
          ]}
        />

        <ModuleSearchBar
          value={registerSearchQuery}
          onChange={setRegisterSearchQuery}
          placeholder="Search obligations, code, jurisdiction..."
          aria-label="Search compliance register"
          resultLabel={
            totalCount === 1
              ? "1 obligation"
              : `${String(totalCount)} obligations`
          }
        />
      </div>

      <div className="mt-[14px] grid grid-cols-1 items-start gap-[13.62px] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <RegulatoryComplianceRegisterCard
          items={obligationItems}
          isLoading={showRegisterLoading}
          pagination={{
            pageNumber,
            pageSize,
            totalRecords: totalCount,
            onPageChange: setPageNumber,
            isLoading: listQuery.isFetching,
          }}
        />

        <div className="flex flex-col gap-[13.62px]">
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
