"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  DEFAULT_COMPLIANCES_PAGE_NUMBER,
  DEFAULT_COMPLIANCES_PAGE_SIZE,
  useComplianceByIdQuery,
  useComplianceCategoryStatsQuery,
  useComplianceDashboardKpisQuery,
  useComplianceUpcomingFilingsQuery,
  useCompliancesListQuery,
} from "@/hooks/use-compliance-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { toUserNameLookup } from "@/lib/map-user";
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
import { RegulatoryComplianceDetailPanel } from "./RegulatoryComplianceDetailPanel";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const accessTokenState = useHasAccessToken();
  const isClientReady = accessTokenState !== null;
  const hasToken = accessTokenState === true;
  const queryEnabled = isClientReady && hasToken;

  const usersQuery = useUserDropdownQuery();
  const responsibleNameById = useMemo(
    () => toUserNameLookup(usersQuery.data?.dataModel ?? []),
    [usersQuery.data?.dataModel],
  );

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

  const selectedListItem =
    selectedId == null
      ? null
      : (obligationItems.find((item) => item.id === selectedId) ?? null);

  const activeId = selectedListItem?.id ?? null;

  const selectedNumericId = useMemo(() => {
    if (selectedListItem == null) {
      return null;
    }
    const parsed = Number(selectedListItem.id);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [selectedListItem]);

  const selectedDetailQuery = useComplianceByIdQuery({
    id: selectedNumericId,
    enabled: queryEnabled && selectedNumericId != null,
    responsibleNameById,
  });

  const handleToggleDetailPanel = useCallback((id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  const isPanelOpen = selectedListItem != null;

  const panelErrorMessage =
    isPanelOpen && selectedDetailQuery.isError
      ? getMutationErrorMessage(
          selectedDetailQuery.error,
          "Failed to load obligation details.",
        )
      : isPanelOpen &&
          !selectedDetailQuery.isLoading &&
          selectedDetailQuery.data == null
        ? "Obligation details were not found."
        : null;

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
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader title="Regulatory Compliance" />

      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        <RegulatoryComplianceKpiGrid
          items={kpiItems}
          isLoading={showKpiLoading}
        />

        <div className="grid min-w-0 gap-3.5 lg:grid-cols-2">
          <RegulatoryComplianceByCategoryCard
            categories={categoryItems}
            isLoading={showCategoryLoading}
          />
          <RegulatoryComplianceUpcomingFilingsCard
            filings={upcomingFilingsQuery.data ?? []}
            isLoading={showUpcomingLoading}
          />
        </div>

        <ModuleFilterBar
          segments={[
            {
              label: "Jurisdiction",
              options: JURISDICTION_OPTIONS,
              value: selectedJurisdiction,
              onChange: (value) => {
                setSelectedJurisdiction(value as JurisdictionType);
                setPageNumber(DEFAULT_COMPLIANCES_PAGE_NUMBER);
                setSelectedId(null);
              },
            },
            {
              label: "Status",
              options: STATUS_OPTIONS,
              value: selectedStatus,
              onChange: (value) => {
                setSelectedStatus(value as ComplianceStatusType);
                setPageNumber(DEFAULT_COMPLIANCES_PAGE_NUMBER);
                setSelectedId(null);
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

        <div
          className={[
            "grid min-w-0 items-start gap-x-3.5 gap-y-5",
            isPanelOpen
              ? "xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"
              : "xl:grid-cols-1",
          ].join(" ")}
        >
          <RegulatoryComplianceRegisterCard
            items={obligationItems}
            selectedId={activeId}
            onViewMore={handleToggleDetailPanel}
            isLoading={showRegisterLoading}
            pagination={{
              pageNumber,
              pageSize,
              totalRecords: totalCount,
              onPageChange: (nextPage) => {
                setPageNumber(nextPage);
                setSelectedId(null);
              },
              isLoading: listQuery.isFetching,
            }}
          />

          {isPanelOpen ? (
            <RegulatoryComplianceDetailPanel
              detail={selectedDetailQuery.data?.detail ?? null}
              isLoading={selectedDetailQuery.isLoading}
              errorMessage={panelErrorMessage}
              onRetry={() => {
                void selectedDetailQuery.refetch();
              }}
              className="min-w-0"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
