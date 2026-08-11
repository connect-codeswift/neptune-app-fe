"use client";

import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import {
  CAPA_PRIORITY_FILTER_OPTIONS,
  CAPA_STATUS_FILTER_OPTIONS,
  CAPA_TYPE_FILTER_OPTIONS,
} from "@/lib/capa-filters";

export type CapaDashboardFiltersProps = Readonly<{
  status: string;
  type: string;
  priority: string;
  shownCount: number;
  totalCount: number;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onMyCapas: () => void;
  onNewCapa: () => void;
}>;

/** Filter toolbar — Figma 7123:42136. Options match GET /api/CAPA query params. */
export function CapaDashboardFilters(props: CapaDashboardFiltersProps) {
  const {
    status,
    type,
    priority,
    shownCount,
    totalCount,
    onStatusChange,
    onTypeChange,
    onPriorityChange,
    onMyCapas,
    onNewCapa,
  } = props;

  return (
    <ModuleFilterBar
      segments={[
        {
          label: "Status",
          options: CAPA_STATUS_FILTER_OPTIONS,
          value: status,
          onChange: onStatusChange,
        },
        {
          label: "Type",
          options: CAPA_TYPE_FILTER_OPTIONS,
          value: type,
          onChange: onTypeChange,
        },
        {
          label: "Priority",
          options: CAPA_PRIORITY_FILTER_OPTIONS,
          value: priority,
          onChange: onPriorityChange,
        },
      ]}
      // meta={`${String(shownCount)} of ${String(totalCount)}`}
      secondaryAction={{
        label: "My CAPAs",
        onClick: onMyCapas,
        icon: "mdi:account-outline",
      }}
      action={{
        label: "New CAPA",
        onClick: onNewCapa,
        icon: "mdi:plus",
      }}
    />
  );
}
