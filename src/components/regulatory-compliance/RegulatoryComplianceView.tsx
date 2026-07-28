"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { IncidentListHeader } from "@/components/incidents/list/IncidentListHeader";
import { RegulatoryComplianceKpiGrid } from "./RegulatoryComplianceKpiGrid";
import { RegulatoryComplianceRegisterCard } from "./RegulatoryComplianceRegisterCard";
import { RegulatoryComplianceByCategoryCard } from "./RegulatoryComplianceByCategoryCard";
import { RegulatoryComplianceUpcomingFilingsCard } from "./RegulatoryComplianceUpcomingFilingsCard";
import {
  INITIAL_CATEGORIES,
  INITIAL_KPI_ITEMS,
  INITIAL_OBLIGATIONS,
  INITIAL_UPCOMING_FILINGS,
} from "./regulatory-compliance-data";

export function RegulatoryComplianceView() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="bg-ehs-light-bg flex flex-1 flex-col gap-6 px-4">
      {/* Top Header from Incident Module */}
      <IncidentListHeader
        title="Regularity Compliance"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications={true}
        showAction={false}
        className="px-0 py-0"
      />

      {/* KPI Cards Row */}
      <RegulatoryComplianceKpiGrid items={INITIAL_KPI_ITEMS} />

      {/* View Mode Toggle: List view (current) / Calendar view */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/dashboard/regulatory-compliance"
          className="bg-ehs-normal-blue text-ehs-light-text inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold shadow-xs transition-all"
        >
          <Icon
            icon="mdi:view-grid-outline"
            className="text-base"
            aria-hidden="true"
          />
          <span>List view</span>
        </Link>

        <Link
          href="/dashboard/regulatory-compliance/calendar"
          className="border-ehs-border text-ehs-dark-bg hover:bg-ehs-light-bg inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-[13px] font-bold shadow-xs transition-all"
        >
          <Icon
            icon="mdi:calendar-month-outline"
            className="text-ehs-normal-blue text-base"
            aria-hidden="true"
          />
          <span>Calendar view</span>
        </Link>
      </div>

      {/* Main Content Grid: Register Table Card (Left) + Right Sidebar Stack */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left: Main Register Table Card */}
        <RegulatoryComplianceRegisterCard
          items={INITIAL_OBLIGATIONS}
          searchQuery={searchQuery}
        />

        {/* Right Sidebar Stack: By Category + Upcoming Filings */}
        <div className="flex flex-col gap-6">
          <RegulatoryComplianceByCategoryCard categories={INITIAL_CATEGORIES} />
          <RegulatoryComplianceUpcomingFilingsCard
            filings={INITIAL_UPCOMING_FILINGS}
          />
        </div>
      </div>
    </div>
  );
}
