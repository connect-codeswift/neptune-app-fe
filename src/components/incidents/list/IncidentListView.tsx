"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { IncidentDetailPanel } from "@/components/incidents/list/IncidentDetailPanel";
import { IncidentFilterBar } from "@/components/incidents/list/IncidentFilterBar";
import { IncidentListKpiCard } from "@/components/incidents/list/IncidentListKpiCard";
import { IncidentListTable } from "@/components/incidents/list/IncidentListTable";
import {
  buildIncidentListKpis,
  incidentMatchesSearch,
  incidentMatchesSeverityFilter,
  toApiSeverityFilter,
  toApiStageFilter,
} from "@/components/incidents/list/incident-list-data";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { SkeletonKpiRow, SkeletonTable } from "@/components/ui/skeletons";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useCloseIncidentMutation } from "@/hooks/use-incident-mutations";
import {
  DEFAULT_INCIDENTS_PAGE_NUMBER,
  DEFAULT_INCIDENTS_PAGE_SIZE,
  useIncidentByIdQuery,
  useIncidentsListQuery,
} from "@/hooks/use-incident-queries";
import { toast } from "@/lib/toast";
import { mapIncidentDtoToListRecord } from "@/services/mappers/incident-list.mapper";

export type IncidentListViewProps = Readonly<{
  searchQuery?: string;
  className?: string;
}>;

/** `searchQuery` is typed live, so settle it before hitting the paged endpoint. */
const SEARCH_DEBOUNCE_MS = 300;

export function IncidentListView(props: Readonly<IncidentListViewProps>) {
  const { searchQuery = "", className = "" } = props;
  const router = useRouter();
  const [stateFilter, setStateFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const accessTokenState = useHasAccessToken();
  const isClientReady = accessTokenState !== null;
  const hasToken = accessTokenState === true;
  const [pageNumber, setPageNumber] = useState(DEFAULT_INCIDENTS_PAGE_NUMBER);
  const [pageSize] = useState(DEFAULT_INCIDENTS_PAGE_SIZE);
  const [appliedSearch, setAppliedSearch] = useState(searchQuery.trim());

  // Debounce the header search box, and rewind to page 1 once it settles —
  // a stale page number would otherwise strand the user on an out-of-range page.
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

  // Every filter change invalidates the current page offset.
  const handleStateFilterChange = (value: string) => {
    setStateFilter(value);
    setPageNumber(DEFAULT_INCIDENTS_PAGE_NUMBER);
  };

  const handleStageFilterChange = (value: string) => {
    setStageFilter(value);
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
    stage: toApiStageFilter(stateFilter, stageFilter),
    enabled: isClientReady && hasToken,
  });
  const closeIncidentMutation = useCloseIncidentMutation();

  const incidents = incidentsQuery.data?.records ?? [];
  const totalCount = incidentsQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const canGoPrevious = pageNumber > 1 && !incidentsQuery.isFetching;
  const canGoNext = pageNumber < totalPages && !incidentsQuery.isFetching;

  /**
   * Second filtering pass, on purpose (belt and braces).
   *
   * `search` / `severity` / `stage` are now sent to GetAllIncidents so
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
      const matchesStage =
        stageFilter === "All" || incident.stage === stageFilter;
      const matchesSeverity = incidentMatchesSeverityFilter(
        incident,
        severityFilter,
      );

      return matchesSearch && matchesState && matchesStage && matchesSeverity;
    });
  }, [incidents, appliedSearch, severityFilter, stageFilter, stateFilter]);

  // Keep the detail sidebar open; default to the first incident on the page,
  // and fall back to it whenever filtering drops the current selection.
  // Derived during render rather than synced through an effect, so there is no
  // pass where the sidebar still points at a row that is no longer listed.
  const selectedListIncident =
    (selectedId == null
      ? undefined
      : filteredIncidents.find((incident) => incident.id === selectedId)) ??
    filteredIncidents[0] ??
    null;

  // Sidebar details come from GetIncidentById — not the list-row payload alone.
  const selectedDetailQuery = useIncidentByIdQuery({
    id: selectedListIncident?.numericId ?? null,
    enabled:
      isClientReady &&
      hasToken &&
      selectedListIncident != null &&
      selectedListIncident.numericId > 0,
  });

  const selectedIncident =
    selectedDetailQuery.data?.dto != null
      ? mapIncidentDtoToListRecord(selectedDetailQuery.data.dto)
      : selectedListIncident;

  const isPanelOpen = selectedListIncident != null;

  const openIncidentDetail = (listId: string) => {
    const incident = filteredIncidents.find((row) => row.id === listId);
    if (!incident || incident.numericId <= 0) {
      return;
    }

    router.push(`/dashboard/incidents/${String(incident.numericId)}`);
  };

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
      await selectedDetailQuery.refetch();
    } catch (error) {
      toast.error(
        "Could not close incident",
        getMutationErrorMessage(error, "Please try again."),
      );
    }
  };
  const kpiMetrics = useMemo(
    () => buildIncidentListKpis(incidentsQuery.data?.items ?? []),
    [incidentsQuery.data?.items],
  );

  const showBootLoading = !isClientReady;
  const showQueryLoading =
    isClientReady && hasToken && incidentsQuery.isLoading;
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
      className={["flex min-w-0 flex-col gap-6", className]
        .filter(Boolean)
        .join(" ")}
    >
      {showBootLoading || showQueryLoading ? (
        <SkeletonKpiRow count={kpiMetrics.length || 4} />
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-x-[14px] gap-y-[14px] sm:grid-cols-2 xl:grid-cols-4">
          {kpiMetrics.map((metric) => (
            <IncidentListKpiCard key={metric.id} {...metric} />
          ))}
        </div>
      )}

      <IncidentFilterBar
        state={stateFilter}
        stage={stageFilter}
        severity={severityFilter}
        onStateChange={handleStateFilterChange}
        onStageChange={handleStageFilterChange}
        onSeverityChange={handleSeverityFilterChange}
      />

      {errorMessage ? (
        <IncidentGlassCard className="min-h-[180px] items-center justify-center gap-2 text-center">
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
        <SkeletonTable rows={8} columns={7} />
      ) : null}

      {!errorMessage &&
      !showBootLoading &&
      !showQueryLoading &&
      isClientReady ? (
        <div
          className={[
            "grid min-w-0 items-start gap-x-[14px] gap-y-6",
            isPanelOpen
              ? "xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"
              : "xl:grid-cols-1",
          ].join(" ")}
        >
          {filteredIncidents.length === 0 ? (
            <IncidentGlassCard className="min-h-[240px] items-center justify-center gap-2 text-center">
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
                  selectedId={selectedListIncident?.id ?? null}
                  onSelect={setSelectedId}
                  onOpenDetail={openIncidentDetail}
                  expanded={!isPanelOpen}
                  className="min-w-0"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Text as="p" className="text-ehs-muted-text text-sm">
                    {[
                      `Page ${String(pageNumber)} of ${String(totalPages)}`,
                      totalCount > 0 ? `${String(totalCount)} total` : null,
                      incidentsQuery.isFetching ? "Loading…" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="tertiary"
                      disabled={!canGoPrevious}
                      onClick={() =>
                        setPageNumber((current) => Math.max(1, current - 1))
                      }
                      className="rounded-[10px] px-3 py-2 text-sm font-semibold disabled:opacity-40"
                    >
                      <Icon
                        icon="mdi:chevron-left"
                        className="size-[14px]"
                        aria-hidden="true"
                      />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="tertiary"
                      disabled={!canGoNext}
                      onClick={() =>
                        setPageNumber((current) =>
                          Math.min(totalPages, current + 1),
                        )
                      }
                      className="rounded-[10px] px-3 py-2 text-sm font-semibold disabled:opacity-40"
                    >
                      Next
                      <Icon
                        icon="mdi:chevron-right"
                        className="size-[14px]"
                        aria-hidden="true"
                      />
                    </Button>
                  </div>
                </div>
              </div>

              {isPanelOpen ? (
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
