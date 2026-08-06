"use client";

import { useState } from "react";
import { CapaListView } from "@/components/capa/CapaListView";
import { DashboardHeader } from "@/components/DashboardHeader";

/** CAPA register page shell — header + search wired to the list view. */
export function CapaPageClient() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <DashboardHeader
        title="CAPA"
        searchPlaceholder="Search CAPAs by code, action or owner..."
        dateRangeLabel="Year to date"
        actionLabel="Create CAPA"        onSearchChange={setSearchQuery}
      />

      <div className="flex min-w-0 flex-1 flex-col px-4 pb-8">
        <CapaListView searchQuery={searchQuery} />
      </div>
    </div>
  );
}
