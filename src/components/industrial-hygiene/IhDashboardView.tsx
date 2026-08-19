"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { IhKpiRow } from "@/components/industrial-hygiene/IhKpiRow";
import { IhModuleTabs } from "@/components/industrial-hygiene/IhModuleTabs";
import { IhMonitoredAgentTypesCard } from "@/components/industrial-hygiene/IhMonitoredAgentTypesCard";
import { IhRecentExceedancesCard } from "@/components/industrial-hygiene/IhRecentExceedancesCard";
import { IhSamplingPlanProgressCard } from "@/components/industrial-hygiene/IhSamplingPlanProgressCard";

/** Industrial Hygiene Overview — Figma 5298:22225. */
export function IhDashboardView() {
  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <DashboardHeader title="Industrial Hygiene Dashboard" showSiteSwitcher />

      <div className="flex min-w-0 flex-1 flex-col gap-4 px-4 pb-8">
        <IhModuleTabs />

        <IhKpiRow />

        <div className="grid grid-cols-1 items-start gap-3.5 xl:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-3.5">
            <IhRecentExceedancesCard />
            <IhMonitoredAgentTypesCard />
          </div>
          <IhSamplingPlanProgressCard />
        </div>
      </div>
    </div>
  );
}
