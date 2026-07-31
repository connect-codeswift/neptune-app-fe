"use client";

import { useState } from "react";
import { IncidentListHeader } from "@/components/incidents/list/IncidentListHeader";
import { AddObligationHeaderCard } from "./AddObligationHeaderCard";
import { AddObligationForm } from "./AddObligationForm";

export function AddObligationView() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="bg-ehs-light-bg flex flex-1 flex-col gap-6 px-4">
      {/* Top Header from Incident Module */}
      <IncidentListHeader
        title=""
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications={true}
        showAction={false}
        searchPosition="start"
        className="px-0 py-0"
      />

      <AddObligationHeaderCard />
      <div className="flex w-full min-w-0 justify-center">
        <AddObligationForm />
      </div>
    </div>
  );
}
