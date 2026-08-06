"use client";

import { useState } from "react";
import { IncidentListHeader } from "@/components/incidents/list/IncidentListHeader";
import { IncidentListViewClient } from "@/components/incidents/list/IncidentListViewClient";
import { IncidentViewTabs } from "@/components/incidents/shared";
import { getDefaultDateRange } from "@/lib/date-range";

export function IncidentsListPageClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState(getDefaultDateRange);

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <IncidentListHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-5 px-3 pb-8 sm:px-6">
        <IncidentViewTabs />
        <IncidentListViewClient
          searchQuery={searchQuery}
          dateRange={dateRange}
        />
      </div>
    </div>
  );
}
