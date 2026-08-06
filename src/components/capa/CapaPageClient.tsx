"use client";

import { CapaListView } from "@/components/capa/CapaListView";
import { DashboardHeader } from "@/components/DashboardHeader";

/** CAPA register page shell — header + list view. */
export function CapaPageClient() {
  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <DashboardHeader title="CAPA" actionLabel="Create CAPA" />

      <div className="flex min-w-0 flex-1 flex-col px-4 pb-8">
        <CapaListView />
      </div>
    </div>
  );
}
