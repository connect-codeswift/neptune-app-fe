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
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
}>;

/** Filter toolbar — GET /api/v1/capas Status, CapaType, Priority.
 *
 * There is no Scope segment: the API has no such parameter. A Worker's rows are
 * narrowed from their token, and anyone holding CAPA.Manage sees the whole site. */
export function CapaDashboardFilters(props: CapaDashboardFiltersProps) {
  const {
    status,
    type,
    priority,
    onStatusChange,
    onTypeChange,
    onPriorityChange,
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
    />
  );
}
