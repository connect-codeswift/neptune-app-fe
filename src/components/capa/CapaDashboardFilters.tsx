"use client";

import { Icon } from "@iconify/react";
import { IncidentSegmentedControl } from "@/components/incidents";
import { Button } from "@/components/ui/Button";
import {
  CAPA_DASHBOARD_STATUS_FILTERS,
  CAPA_DASHBOARD_TYPE_FILTERS,
} from "@/components/capa/capa-dashboard-data";

export type CapaDashboardFiltersProps = Readonly<{
  status: string;
  type: string;
  shownCount: number;
  totalCount: number;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onMyCapas: () => void;
  onNewCapa: () => void;
}>;

/** Filter toolbar — Figma 7123:42136. */
export function CapaDashboardFilters(props: CapaDashboardFiltersProps) {
  const {
    status,
    type,
    shownCount,
    totalCount,
    onStatusChange,
    onTypeChange,
    onMyCapas,
    onNewCapa,
  } = props;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-white/80 bg-white/60 px-3.5 py-3 shadow-sm backdrop-blur-md sm:px-4">
      <span className="text-ehs-muted-text text-sm font-bold tracking-wide uppercase">
        Filter
      </span>

      <IncidentSegmentedControl
        label="Status"
        options={CAPA_DASHBOARD_STATUS_FILTERS}
        value={status}
        onChange={onStatusChange}
        className="min-w-fit flex-1"
      />

      <IncidentSegmentedControl
        label="Type"
        options={CAPA_DASHBOARD_TYPE_FILTERS}
        value={type}
        onChange={onTypeChange}
        className="min-w-fit flex-1"
      />

      <span className="text-ehs-muted-text text-sm tabular-nums">
        {`${String(shownCount)} of ${String(totalCount)}`}
      </span>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onMyCapas}
          className="rounded-xl px-3.5 py-2 text-sm"
        >
          My CAPAs
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onNewCapa}
          className="rounded-xl px-3.5 py-2 text-sm"
        >
          <Icon icon="mdi:plus" className="size-3.5" aria-hidden />
          New CAPA
        </Button>
      </div>
    </div>
  );
}
