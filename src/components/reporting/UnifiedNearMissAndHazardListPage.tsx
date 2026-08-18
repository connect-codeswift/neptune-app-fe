"use client";

import type { ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ReportingRegisterHeader } from "@/components/reporting/ReportingRegisterHeader";
import { UnifiedNearMissAndHazardListPageSkeleton } from "@/components/reporting/UnifiedNearMissAndHazardListPageSkeleton";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  MetricCardsRow,
  type MetricCardProps,
} from "@/components/ui/MetricCard";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import { SkeletonTable } from "@/components/ui/skeletons";
import { Table, type TablePagination } from "@/components/ui/Table";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { complianceGlassCardClass } from "@/components/regulatory-compliance/compliance-ui";

export type UnifiedNearMissAndHazardListPageProps<TData> = Readonly<{
  title: string;
  isLoading: boolean;
  isTableLoading?: boolean;
  canViewInsights: boolean;
  metrics: readonly MetricCardProps[];
  statusOptions: readonly string[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  reportActionLabel: string;
  onReportClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  searchAriaLabel: string;
  resultLabel?: string;
  listError?: string | null;
  onRetry?: () => void;
  itemNoun: string;
  itemNounPlural: string;
  registerCount?: number;
  table: Readonly<{
    data: readonly TData[];
    columns: ColumnDef<TData, unknown>[];
    getRowId: (row: TData) => string;
    pagination: TablePagination;
    selectedRowId?: string | null;
  }>;
  /** Side card opened from the table eye icon, same split as Audits / CAPA. */
  detailPanel?: ReactNode;
  /** Insights row under KPIs (heatmap, recognition, …) — BBS-style. */
  insights?: ReactNode;
}>;

/**
 * Shared list-page chrome for Near Miss and Hazard. Module clients own data
 * fetching and pass UI props / insights slots into this layout.
 * Order: KPIs → insights → filter → search → table (same as BBS / Audits).
 */
export function UnifiedNearMissAndHazardListPage<TData>(
  props: Readonly<UnifiedNearMissAndHazardListPageProps<TData>>,
) {
  const {
    title,
    isLoading,
    isTableLoading = false,
    canViewInsights,
    metrics,
    statusOptions,
    selectedStatus,
    onStatusChange,
    reportActionLabel,
    onReportClick,
    searchQuery,
    onSearchChange,
    searchPlaceholder = "Search by title, location, reporter...",
    searchAriaLabel,
    resultLabel,
    listError,
    onRetry,
    itemNoun,
    itemNounPlural,
    registerCount,
    table,
    detailPanel,
    insights,
  } = props;

  const showInsightsSkeleton = isLoading && canViewInsights;
  const isPanelOpen = detailPanel != null;

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader title={title} />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        {showInsightsSkeleton ? (
          <UnifiedNearMissAndHazardListPageSkeleton />
        ) : (
          <>
            {canViewInsights ? <MetricCardsRow metrics={metrics} /> : null}

            {canViewInsights && insights ? (
              <div className="grid min-w-0 gap-3.5 lg:grid-cols-2">
                {insights}
              </div>
            ) : null}
          </>
        )}

        <ModuleFilterBar
          segments={[
            {
              label: "Status",
              options: statusOptions,
              value: selectedStatus,
              onChange: onStatusChange,
            },
          ]}
        />

        <ModuleSearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          aria-label={searchAriaLabel}
          resultLabel={resultLabel}
        />

        {listError ? (
          <IncidentGlassCard
            className="min-h-45 text-center"
            incidentGlassCardClassName="items-center justify-center gap-2"
          >
            <Icon
              icon="mdi:alert-circle-outline"
              className="text-ehs-red size-8"
              aria-hidden="true"
            />
            <Text as="p" className="text4 text-ehs-darker">
              {`Could not load ${itemNounPlural}`}
            </Text>
            <Text as="p" className="text8 text-ehs-muted-text">
              {listError}
            </Text>
            {onRetry ? (
              <Button
                type="button"
                variant="secondary"
                onClick={onRetry}
                className="mt-1"
              >
                Retry
              </Button>
            ) : null}
          </IncidentGlassCard>
        ) : null}

        {isTableLoading && !listError ? (
          <SkeletonTable rows={8} columns={6} />
        ) : null}

        {!isTableLoading && !listError ? (
          <div
            className={[
              "grid min-w-0 items-start gap-x-3.5 gap-y-5",
              isPanelOpen
                ? "xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"
                : "xl:grid-cols-1",
            ].join(" ")}
          >
            <Table
              variant="compliance"
              data={table.data}
              columns={table.columns}
              getRowId={table.getRowId}
              selectedRowId={table.selectedRowId}
              containerClassName={[complianceGlassCardClass, "min-w-0"].join(" ")}
              header={
                <ReportingRegisterHeader
                  count={registerCount}
                  itemNoun={itemNoun}
                  itemNounPlural={itemNounPlural}
                  actionLabel={reportActionLabel}
                  onAction={onReportClick}
                />
              }
              pagination={table.pagination}
            />
            {isPanelOpen ? detailPanel : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
