"use client";

import { IncidentListHeader } from "@/components/incidents/list/IncidentListHeader";
import { IncidentListViewClient } from "@/components/incidents/list/IncidentListViewClient";
import { IncidentViewTabs } from "@/components/incidents/shared";

export function IncidentsListPageClient() {
  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <IncidentListHeader />
      <div className="flex min-w-0 flex-1 flex-col gap-5 px-3 pb-8 sm:px-6">
        <IncidentViewTabs />
        <IncidentListViewClient />
      </div>
    </div>
  );
}
