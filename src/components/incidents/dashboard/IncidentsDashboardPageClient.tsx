"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { IncidentKpisDashboard } from "@/components/incidents/dashboard";
import { IncidentViewTabs } from "@/components/incidents/shared";

export function IncidentsDashboardPageClient() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader title="Incident KPIs" />
      <div className="flex flex-1 flex-col gap-5 px-3 pb-8 sm:px-4">
        <IncidentViewTabs />
        <IncidentKpisDashboard />
      </div>
    </div>
  );
}
