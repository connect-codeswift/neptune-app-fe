"use client";

import { CapaDashboardView } from "@/components/capa/CapaDashboardView";
import { DashboardHeader } from "@/components/DashboardHeader";

/** CAPA register page shell — header + list view. */
export function CapaPageClient() {
  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <DashboardHeader title="CAPA" showSiteSwitcher />

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-4 pb-8">
        <CapaDashboardView />
      </div>
    </div>
  );
}
