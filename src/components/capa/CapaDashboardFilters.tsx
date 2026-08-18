"use client";

import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import {
  CAPA_PRIORITY_FILTER_OPTIONS,
  CAPA_SCOPE_FILTER_OPTIONS,
  CAPA_STATUS_FILTER_OPTIONS,
  CAPA_TYPE_FILTER_OPTIONS,
} from "@/lib/capa-filters";

export type CapaDashboardFiltersProps = Readonly<{
  scope: string;
  status: string;
  type: string;
  priority: string;
  onScopeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
}>;

/** Filter toolbar — GET /api/CAPA Scope, Status, CapaType, Priority. */
export function CapaDashboardFilters(props: CapaDashboardFiltersProps) {
  const {
    scope,
    status,
    type,
    priority,
    onScopeChange,
    onStatusChange,
    onTypeChange,
    onPriorityChange,
  } = props;

  return (
    <ModuleFilterBar
      segments={[
        {
          label: "Scope",
          options: CAPA_SCOPE_FILTER_OPTIONS,
          value: scope,
          onChange: onScopeChange,
        },
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
    />
  );
}
