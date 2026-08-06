"use client";

import { useState } from "react";
import {
  IncidentKpisDashboard,
  IncidentKpisHeader,
} from "@/components/incidents/dashboard";
import { IncidentViewTabs } from "@/components/incidents/shared";
import { getPresetDateRange } from "@/lib/date-range";

export function IncidentsDashboardPageClient() {
  const [dateRange, setDateRange] = useState(() =>
    getPresetDateRange("year_to_date"),
  );

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <IncidentKpisHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      <div className="flex flex-1 flex-col gap-5 px-4 pb-8">
        <IncidentViewTabs />
        <IncidentKpisDashboard />
      </div>
    </div>
  );
}
