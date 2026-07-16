"use client";

import { useMemo, useState } from "react";
import { IncidentDetailPanel } from "@/components/incidents/list/IncidentDetailPanel";
import { IncidentFilterBar } from "@/components/incidents/list/IncidentFilterBar";
import { IncidentListKpiCard } from "@/components/incidents/list/IncidentListKpiCard";
import { IncidentListTable } from "@/components/incidents/list/IncidentListTable";
import {
  INCIDENT_RECORDS,
  LIST_KPI_METRICS,
} from "@/components/incidents/list/incident-list-data";

export type IncidentListViewProps = Readonly<{
  className?: string;
}>;

export function IncidentListView(props: Readonly<IncidentListViewProps>) {
  const { className = "" } = props;
  const [stateFilter, setStateFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(
    INCIDENT_RECORDS[0]?.id ?? null,
  );

  const filteredIncidents = useMemo(() => {
    return INCIDENT_RECORDS.filter((incident) => {
      const matchesState =
        stateFilter === "All" || incident.state === stateFilter;
      const matchesStage =
        stageFilter === "All" || incident.stage === stageFilter;
      const matchesSeverity =
        severityFilter === "All" || incident.severity === severityFilter;

      return matchesState && matchesStage && matchesSeverity;
    });
  }, [severityFilter, stageFilter, stateFilter]);

  const selectedIncident =
    selectedId == null
      ? null
      : (filteredIncidents.find((incident) => incident.id === selectedId) ??
        null);

  const isPanelOpen = selectedIncident != null;

  return (
    <div
      className={["flex min-w-0 flex-col gap-6", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="grid min-w-0 gap-x-[14px] gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
        {LIST_KPI_METRICS.map((metric) => (
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

      <div
        className={[
          "grid min-w-0 items-start gap-x-[14px] gap-y-6",
          isPanelOpen
            ? "xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"
            : "xl:grid-cols-1",
        ].join(" ")}
      >
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
      </div>
    </div>
  );
}
