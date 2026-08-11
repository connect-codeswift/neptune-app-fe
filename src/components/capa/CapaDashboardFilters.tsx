"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
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
    <div className="flex flex-col gap-3">
      <ModuleFilterBar
        segments={[
          {
            label: "Status",
            options: CAPA_DASHBOARD_STATUS_FILTERS,
            value: status,
            onChange: onStatusChange,
          },
          {
            label: "Type",
            options: CAPA_DASHBOARD_TYPE_FILTERS,
            value: type,
            onChange: onTypeChange,
          },
        ]}
        action={{
          label: "New CAPA",
          onClick: onNewCapa,
          icon: "mdi:plus",
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-ehs-muted-text text-sm tabular-nums">
          {`${String(shownCount)} of ${String(totalCount)}`}
        </span>

        <Button
          type="button"
          variant="secondary"
          onClick={onMyCapas}
          className="rounded-xl px-3.5 py-2 text-sm"
        >
          <Icon icon="mdi:account-outline" className="size-3.5" aria-hidden />
          My CAPAs
        </Button>
      </div>
    </div>
  );
}
