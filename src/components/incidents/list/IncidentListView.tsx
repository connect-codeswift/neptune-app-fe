"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentDetailPanel } from "@/components/incidents/list/IncidentDetailPanel";
import { IncidentFilterBar } from "@/components/incidents/list/IncidentFilterBar";
import { IncidentListKpiCard } from "@/components/incidents/list/IncidentListKpiCard";
import { IncidentListTable } from "@/components/incidents/list/IncidentListTable";
import { buildIncidentListKpis } from "@/components/incidents/list/incident-list-data";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useIncidentsListQuery } from "@/hooks/use-incident-queries";
import { getAccessToken } from "@/lib/axios";

export type IncidentListViewProps = Readonly<{
  className?: string;
}>;

export function IncidentListView(props: Readonly<IncidentListViewProps>) {
  const { className = "" } = props;
  const [stateFilter, setStateFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isClientReady, setIsClientReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(getAccessToken()));
    setIsClientReady(true);
  }, []);

  const incidentsQuery = useIncidentsListQuery({
    enabled: isClientReady && hasToken,
  });

  const incidents = incidentsQuery.data?.records ?? [];

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesState =
        stateFilter === "All" || incident.state === stateFilter;
      const matchesStage =
        stageFilter === "All" || incident.stage === stageFilter;
      const matchesSeverity =
        severityFilter === "All" || incident.severity === severityFilter;

      return matchesState && matchesStage && matchesSeverity;
    });
  }, [incidents, severityFilter, stageFilter, stateFilter]);

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

      return null;
    });
  }, [filteredIncidents]);

  const selectedIncident =
    selectedId == null
      ? null
      : (filteredIncidents.find((incident) => incident.id === selectedId) ??
        null);

  const isPanelOpen = selectedIncident != null;
  const kpiMetrics = useMemo(
    () => buildIncidentListKpis(filteredIncidents),
    [filteredIncidents],
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
      <div className="grid min-w-0 gap-x-[14px] gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
        {kpiMetrics.map((metric) => (
          <IncidentListKpiCard key={metric.title} {...metric} />
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
              <IncidentListTable
                incidents={filteredIncidents}
                selectedId={selectedIncident?.id ?? null}
                onSelect={setSelectedId}
                expanded={!isPanelOpen}
                className="min-w-0"
              />
              {isPanelOpen ? (
                <IncidentDetailPanel
                  incident={selectedIncident}
                  onClose={() => setSelectedId(null)}
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
