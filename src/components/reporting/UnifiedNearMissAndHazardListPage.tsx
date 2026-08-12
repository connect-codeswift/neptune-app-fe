"use client";

import type { ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  MetricCardsRow,
  type MetricCardProps,
} from "@/components/ui/MetricCard";
import { Table, type TablePagination } from "@/components/ui/Table";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import { UnifiedNearMissAndHazardListPageSkeleton } from "@/components/reporting/UnifiedNearMissAndHazardListPageSkeleton";

export type UnifiedNearMissAndHazardListPageProps<TData> = Readonly<{
  title: string;
  isLoading: boolean;
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
  listError?: string | null;
  table: Readonly<{
    data: readonly TData[];
    columns: ColumnDef<TData, unknown>[];
    getRowId: (row: TData) => string;
    pagination: TablePagination;
  }>;
  /** Insights row under KPIs (heatmap, recognition, …) — BBS-style. */
  insights?: ReactNode;
}>;

/**
 * Shared list-page chrome for Near Miss and Hazard. Module clients own data
 * fetching and pass UI props / insights slots into this layout.
 * Order: KPIs → insights → filter → search → table (same as BBS).
 */
export function UnifiedNearMissAndHazardListPage<TData>(
  props: Readonly<UnifiedNearMissAndHazardListPageProps<TData>>,
) {
  const {
    title,
    isLoading,
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
    listError,
    table,
    insights,
  } = props;

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader title={title} />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        {isLoading ? (
          <UnifiedNearMissAndHazardListPageSkeleton />
        ) : (
          <>
            {canViewInsights ? <MetricCardsRow metrics={metrics} /> : null}

            {canViewInsights && insights ? (
              <div className="grid min-w-0 gap-3.5 lg:grid-cols-2">
                {insights}
              </div>
            ) : null}

            <ModuleFilterBar
              segments={[
                {
                  label: "Status",
                  options: statusOptions,
                  value: selectedStatus,
                  onChange: onStatusChange,
                },
              ]}
              action={{
                label: reportActionLabel,
                onClick: onReportClick,
              }}
            />

            <ModuleSearchBar
              value={searchQuery}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              aria-label={searchAriaLabel}
            />

            <div className="flex min-w-0 flex-col gap-2">
              {listError ? (
                <p className="text4 text-ehs-red">{listError}</p>
              ) : null}

              <Table
                data={table.data}
                columns={table.columns}
                getRowId={table.getRowId}
                containerClassName="min-w-0 shadow-sm"
                pagination={table.pagination}
                variant="incident"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
