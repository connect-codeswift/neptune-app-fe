"use client";

import { useEffect, useMemo, useState } from "react";
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
} from "@/components/incidents/list/incident-list-data";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCloseIncidentMutation } from "@/hooks/use-incident-mutations";
import {
  DEFAULT_INCIDENTS_PAGE_NUMBER,
  DEFAULT_INCIDENTS_PAGE_SIZE,
  useIncidentsListQuery,
} from "@/hooks/use-incident-queries";
import { getAccessToken } from "@/lib/axios";
import { toast } from "@/lib/toast";

export type IncidentListViewProps = Readonly<{
  searchQuery?: string;
  className?: string;
}>;

export function IncidentListView(props: Readonly<IncidentListViewProps>) {
  const { searchQuery = "", className = "" } = props;
  const [stateFilter, setStateFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isClientReady, setIsClientReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [pageNumber, setPageNumber] = useState(DEFAULT_INCIDENTS_PAGE_NUMBER);
  const [pageSize] = useState(DEFAULT_INCIDENTS_PAGE_SIZE);

  useEffect(() => {
    setHasToken(Boolean(getAccessToken()));
    setIsClientReady(true);
  }, []);

  const incidentsQuery = useIncidentsListQuery({
    pageNumber,
    pageSize,
    enabled: isClientReady && hasToken,
  });
  const closeIncidentMutation = useCloseIncidentMutation();

  const incidents = incidentsQuery.data?.records ?? [];
  const totalCount = incidentsQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const canGoPrevious = pageNumber > 1 && !incidentsQuery.isFetching;
  const canGoNext = pageNumber < totalPages && !incidentsQuery.isFetching;

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch = incidentMatchesSearch(incident, searchQuery);
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
  }, [incidents, searchQuery, severityFilter, stageFilter, stateFilter]);

  // Keep the detail sidebar open; default to the first incident on the page.
  useEffect(() => {
    if (filteredIncidents.length === 0) {
      setSelectedId(null);
      return;
    }

    setSelectedId((current) => {
      if (
        current != null &&
        filteredIncidents.some((incident) => incident.id === current)
      ) {
        return current;
      }

      return filteredIncidents[0]?.id ?? null;
    });
  }, [filteredIncidents]);

  const selectedIncident =
    selectedId == null
      ? null
      : (filteredIncidents.find((incident) => incident.id === selectedId) ??
        filteredIncidents[0] ??
        null);

  const isPanelOpen = selectedIncident != null;

  const handleCloseIncident = async () => {
    if (!selectedIncident) {
      return;
    }

    try {
      await closeIncidentMutation.mutateAsync(selectedIncident.numericId);
      toast.success(
        "Incident closed",
        `${selectedIncident.id} is now Closed and still available in filters.`,
      );
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
      <div className="grid min-w-0 grid-cols-1 gap-x-[14px] gap-y-[14px] sm:grid-cols-2 xl:grid-cols-4">
        {kpiMetrics.map((metric) => (
          <IncidentListKpiCard key={metric.id} {...metric} />
        ))}
      </div>

      <IncidentFilterBar
        state={stateFilter}
        stage={stageFilter}
        severity={severityFilter}
        onStateChange={setStateFilter}
        onStageChange={setStageFilter}
        onSeverityChange={setSeverityFilter}
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
              className="border-ehs-border text-ehs-gray hover:bg-ehs-light-bg mt-1 inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-[13px] font-semibold"
            >
              <Icon icon="mdi:refresh" className="size-4" aria-hidden="true" />
              Retry
            </button>
          ) : null}
        </IncidentGlassCard>
      ) : null}

      {!errorMessage && (showBootLoading || showQueryLoading) ? (
        <IncidentGlassCard className="min-h-[240px] items-center justify-center gap-2">
          <Icon
            icon="mdi:loading"
            className="text-ehs-dark-blue size-7 animate-spin"
            aria-hidden="true"
          />
          <Text as="p" className="text-ehs-muted-text text-sm">
            Loading incidents…
          </Text>
        </IncidentGlassCard>
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
                  selectedId={selectedIncident?.id ?? null}
                  onSelect={setSelectedId}
                  expanded={!isPanelOpen}
                  className="min-w-0"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Text as="p" className="text-ehs-muted-text text-[12px]">
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
                      className="rounded-[10px] px-3 py-2 text-[13px] font-semibold disabled:opacity-40"
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
                      className="rounded-[10px] px-3 py-2 text-[13px] font-semibold disabled:opacity-40"
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
