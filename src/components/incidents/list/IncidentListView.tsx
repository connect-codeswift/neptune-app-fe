"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { IncidentDetailPanel } from "@/components/incidents/list/IncidentDetailPanel";
import { MetricCard } from "@/components/ui/MetricCard";
import { IncidentListTable } from "@/components/incidents/list/IncidentListTable";
import {
  SEVERITY_FILTERS,
  STATE_FILTERS,
  incidentMatchesDateRange,
  incidentMatchesSearch,
  incidentMatchesSeverityFilter,
  toApiSeverityFilter,
} from "@/components/incidents/list/incident-list-data";
import { IncidentGlassCard } from "@/components/incidents/shared";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import { SkeletonKpiRow, SkeletonTable } from "@/components/ui/skeletons";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useCloseIncidentMutation } from "@/hooks/use-incident-mutations";
import {
  useIncidentListKpisQuery,
  useKpiTargetsQuery,
  useSiteWorkHoursQuery,
} from "@/hooks/use-incident-kpi-queries";
import {
  DEFAULT_INCIDENTS_PAGE_NUMBER,
  DEFAULT_INCIDENTS_PAGE_SIZE,
  useIncidentByIdQuery,
  useIncidentClosureQuery,
  useIncidentsListQuery,
} from "@/hooks/use-incident-queries";
import type { DateRange } from "@/lib/date-range";
import { toast } from "@/lib/toast";
import { mapIncidentDtoToListRecord } from "@/services/mappers/incident-list.mapper";
import type { IncidentRecord } from "@/components/incidents/list/incident-list-types";
import {
  mapIncidentListKpisToMetrics,
  mapKpiTargetsToLookup,
  hasSufficientSiteWorkHours,
} from "@/services/mappers/incident-kpi.mapper";

export type IncidentListViewProps = Readonly<{
  dateRange?: DateRange;
  className?: string;
}>;

/** Search is typed live — settle before hitting the paged endpoint. */
const SEARCH_DEBOUNCE_MS = 300;

function withClosedState(
  record: IncidentRecord,
  closed: boolean,
): IncidentRecord {
  return closed && record.state !== "Closed"
    ? { ...record, state: "Closed" }
    : record;
}

export function IncidentListView(props: Readonly<IncidentListViewProps>) {
  const { dateRange, className = "" } = props;
  const [stateFilter, setStateFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const accessTokenState = useHasAccessToken();
  const isClientReady = accessTokenState !== null;
  const hasToken = accessTokenState === true;
  const [pageNumber, setPageNumber] = useState(DEFAULT_INCIDENTS_PAGE_NUMBER);
  const [pageSize] = useState(DEFAULT_INCIDENTS_PAGE_SIZE);
  const [appliedSearch, setAppliedSearch] = useState("");

  // Debounce search and rewind to page 1 once it settles — a stale page
  // number would otherwise strand the user on an out-of-range page.
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed === appliedSearch) {
      return;
    }

    const timer = setTimeout(() => {
      setAppliedSearch(trimmed);
      setPageNumber(DEFAULT_INCIDENTS_PAGE_NUMBER);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery, appliedSearch]);

  useEffect(() => {
    setPageNumber(DEFAULT_INCIDENTS_PAGE_NUMBER);
  }, [dateRange?.start.getTime(), dateRange?.end.getTime()]);

  // Every filter change invalidates the current page offset.
  const handleStateFilterChange = (value: string) => {
    setStateFilter(value);
    setPageNumber(DEFAULT_INCIDENTS_PAGE_NUMBER);
  };

  const handleSeverityFilterChange = (value: string) => {
    setSeverityFilter(value);
    setPageNumber(DEFAULT_INCIDENTS_PAGE_NUMBER);
  };

  const incidentsQuery = useIncidentsListQuery({
    pageNumber,
    pageSize,
    search: appliedSearch,
    severity: toApiSeverityFilter(severityFilter),
    enabled: isClientReady && hasToken,
  });
  const listKpisQuery = useIncidentListKpisQuery(isClientReady && hasToken);
  const kpiTargetsQuery = useKpiTargetsQuery(isClientReady && hasToken);
  const siteWorkHoursQuery = useSiteWorkHoursQuery(isClientReady && hasToken);
  const closeIncidentMutation = useCloseIncidentMutation();

  const incidents = incidentsQuery.data?.records ?? [];
  const totalCount = incidentsQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const canGoPrevious = pageNumber > 1 && !incidentsQuery.isFetching;
  const canGoNext = pageNumber < totalPages && !incidentsQuery.isFetching;

  /**
   * Second filtering pass, on purpose (belt and braces).
   *
   * `search` / `severity` are now sent to GetAllIncidents so
   * filtering spans every page instead of the 10 visible rows. But backend
   * deploys here are manual and can lag the frontend: an older API silently
   * ignores the new params and returns an unfiltered page. Re-running the
   * filters locally is a no-op when the server honored them, and keeps the list
   * correct (page-scoped, as before) when it did not. `state: Open` has no
   * server counterpart and is only ever filtered here.
   */
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch = incidentMatchesSearch(incident, appliedSearch);
      const matchesState =
        stateFilter === "All" || incident.state === stateFilter;
      const matchesSeverity = incidentMatchesSeverityFilter(
        incident,
        severityFilter,
      );
      const matchesDateRange =
        dateRange == null || incidentMatchesDateRange(incident, dateRange);

      return (
        matchesSearch && matchesState && matchesSeverity && matchesDateRange
      );
    });
  }, [incidents, appliedSearch, severityFilter, stateFilter, dateRange]);

  // Preview panel toggles from the view / close icon in the table.
  const selectedListIncident =
    selectedId == null
      ? null
      : (filteredIncidents.find((incident) => incident.id === selectedId) ??
        null);

  useEffect(() => {
    if (selectedId != null && selectedListIncident == null) {
      setSelectedId(null);
    }
  }, [selectedId, selectedListIncident]);

  // Sidebar details come from GetIncidentById — not the list-row payload alone.
  const selectedDetailQuery = useIncidentByIdQuery({
    id: selectedListIncident?.numericId ?? null,
    alwaysFresh: true,
    enabled:
      isClientReady &&
      hasToken &&
      selectedListIncident != null &&
      selectedListIncident.numericId > 0,
  });

  const isPanelOpen = selectedListIncident != null;

  const selectedClosureQuery = useIncidentClosureQuery({
    incidentId: selectedListIncident?.numericId ?? null,
    enabled:
      isClientReady &&
      hasToken &&
      isPanelOpen &&
      (selectedListIncident?.numericId ?? 0) > 0,
  });

  const selectedIncident = useMemo(() => {
    if (selectedDetailQuery.data?.dto != null) {
      return mapIncidentDtoToListRecord(selectedDetailQuery.data.dto);
    }

    if (!selectedListIncident) {
      return null;
    }

    const closureClosed =
      selectedClosureQuery.data?.closureStatus?.trim().toLowerCase() ===
      "closed";
    return closureClosed
      ? withClosedState(selectedListIncident, true)
      : selectedListIncident;
  }, [
    selectedDetailQuery.data?.dto,
    selectedListIncident,
    selectedClosureQuery.data?.closureStatus,
  ]);

  const handleToggleDetailPanel = useCallback((id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  const handleCloseIncident = async () => {
    const target = selectedIncident ?? selectedListIncident;
    if (!target) {
      return;
    }

    try {
      await closeIncidentMutation.mutateAsync(target.numericId);
      toast.success(
        "Incident closed",
        `${target.id} is now Closed and still available in filters.`,
      );
      await Promise.all([
        incidentsQuery.refetch(),
        selectedDetailQuery.refetch(),
        selectedClosureQuery.refetch(),
      ]);
    } catch (error) {
      toast.error(
        "Could not close incident",
        getMutationErrorMessage(error, "Please try again."),
      );
    }
  };
  const targetsLookup = useMemo(
    () => mapKpiTargetsToLookup(kpiTargetsQuery.data?.dataModel),
    [kpiTargetsQuery.data?.dataModel],
  );

  const ratesAvailable = hasSufficientSiteWorkHours(
    siteWorkHoursQuery.data?.dataModel,
  );

  const kpiMetrics = useMemo(
    () =>
      mapIncidentListKpisToMetrics(
        listKpisQuery.data?.dataModel,
        targetsLookup,
        ratesAvailable,
      ),
    [listKpisQuery.data?.dataModel, targetsLookup, ratesAvailable],
  );

  const showBootLoading = !isClientReady;
  const showKpiLoading =
    showBootLoading || (hasToken && listKpisQuery.isLoading);
  const showQueryLoading =
    isClientReady && hasToken && incidentsQuery.isLoading;
  const kpiErrorMessage =
    isClientReady && !hasToken
      ? "Please sign in to load incident KPIs."
      : isClientReady && listKpisQuery.isError
        ? getMutationErrorMessage(
            listKpisQuery.error,
            "Failed to load incident KPIs.",
          )
        : null;
  const errorMessage =
    isClientReady && !hasToken
      ? "Please sign in to load incidents."
      : isClientReady && incidentsQuery.isError
        ? getMutationErrorMessage(
            incidentsQuery.error,
            "Failed to load incidents.",
          )
        : null;

  return (
    <div
      className={["flex min-w-0 flex-col gap-5", className]
        .filter(Boolean)
        .join(" ")}
    >
      {showKpiLoading ? (
        <SkeletonKpiRow count={4} />
      ) : (
        <div className="flex flex-col gap-2">
          {kpiErrorMessage ? (
            <Text as="p" className="text-ehs-red text-sm">
              {kpiErrorMessage}
            </Text>
          ) : null}
          <div className="stagger-cards grid min-w-0 grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            {kpiMetrics.map((metric) => (
              <MetricCard key={metric.id} {...metric} />
            ))}
          </div>
        </div>
      )}

      <ModuleFilterBar
        segments={[
          {
            label: "State",
            options: STATE_FILTERS,
            value: stateFilter,
            onChange: handleStateFilterChange,
          },
          {
            label: "Severity",
            options: SEVERITY_FILTERS,
            value: severityFilter,
            onChange: handleSeverityFilterChange,
          },
        ]}
      />

      <ModuleSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by ID, title, site..."
        aria-label="Search incidents"
        resultLabel={`${String(filteredIncidents.length)} ${
          filteredIncidents.length === 1 ? "incident" : "incidents"
        }`}
      />

      {errorMessage ? (
        <IncidentGlassCard
          className="min-h-[180px] text-center"
          incidentGlassCardClassName="items-center justify-center gap-2"
        >
          <Icon
            icon="mdi:alert-circle-outline"
            className="text-ehs-red size-8"
            aria-hidden="true"
          />
          <Text as="p" className="text-ehs-darker text-sm font-semibold">
            Couldn’t load incidents
          </Text>
          <Text as="p" className="text-ehs-muted-text max-w-md text-sm">
            {errorMessage}
          </Text>
          {hasToken ? (
            <button
              type="button"
              onClick={() => void incidentsQuery.refetch()}
              className="border-ehs-border text-ehs-gray hover:bg-ehs-light-bg mt-1 inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-sm font-semibold"
            >
              <Icon icon="mdi:refresh" className="size-4" aria-hidden="true" />
              Retry
            </button>
          ) : null}
        </IncidentGlassCard>
      ) : null}

      {!errorMessage && (showBootLoading || showQueryLoading) ? (
        <SkeletonTable rows={8} columns={5} />
      ) : null}

      {!errorMessage &&
      !showBootLoading &&
      !showQueryLoading &&
      isClientReady ? (
        <div
          className={[
            "grid min-w-0 items-start gap-x-3.5 gap-y-5",
            isPanelOpen
              ? "xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"
              : "xl:grid-cols-1",
          ].join(" ")}
        >
          {filteredIncidents.length === 0 ? (
            <IncidentGlassCard
              className="min-h-[240px] text-center"
              incidentGlassCardClassName="items-center justify-center gap-2"
            >
              <Icon
                icon="mdi:clipboard-text-off-outline"
                className="text-ehs-muted-text size-8"
                aria-hidden="true"
              />
              <Text as="p" className="text-ehs-darker text-sm font-semibold">
                No incidents found
              </Text>
              <Text as="p" className="text-ehs-muted-text max-w-md text-sm">
                Try adjusting filters, or report a new incident to get started.
              </Text>
            </IncidentGlassCard>
          ) : (
            <>
              <div className="flex min-w-0 flex-col gap-3">
                <IncidentListTable
                  incidents={filteredIncidents}
                  selectedId={selectedId}
                  onViewMore={handleToggleDetailPanel}
                  expanded={!isPanelOpen}
                  className="min-w-0"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(15,23,42,0.08)] pt-3">
                  <Text as="p" className="text-ehs-muted-text text-sm">
                    {[
                      `Page ${String(pageNumber)} of ${String(totalPages)}`,
                      totalCount > 0 ? `${String(totalCount)} total` : null,
                      incidentsQuery.isFetching ? "Loading…" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>

                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="tertiary"
                      aria-label="Previous page"
                      disabled={!canGoPrevious}
                      onClick={() =>
                        setPageNumber((current) => Math.max(1, current - 1))
                      }
                      className="rounded-lg px-2.5 py-1.5 text-sm font-semibold disabled:opacity-40"
                    >
                      <Icon
                        icon="mdi:chevron-left"
                        className="size-4"
                        aria-hidden="true"
                      />
                    </Button>
                    <Button
                      type="button"
                      variant="tertiary"
                      aria-label="Next page"
                      disabled={!canGoNext}
                      onClick={() =>
                        setPageNumber((current) =>
                          Math.min(totalPages, current + 1),
                        )
                      }
                      className="rounded-lg px-2.5 py-1.5 text-sm font-semibold disabled:opacity-40"
                    >
                      <Icon
                        icon="mdi:chevron-right"
                        className="size-4"
                        aria-hidden="true"
                      />
                    </Button>
                  </div>
                </div>
              </div>

              {isPanelOpen && selectedListIncident ? (
                <IncidentDetailPanel
                  incident={selectedIncident}
                  onCloseIncident={() => {
                    void handleCloseIncident();
                  }}
                  isClosingIncident={closeIncidentMutation.isPending}
                  className="min-w-0"
                />
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
