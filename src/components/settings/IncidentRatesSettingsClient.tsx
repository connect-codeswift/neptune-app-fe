"use client";

import { SettingsShell } from "@/components/settings/SettingsShell";
import { SiteWorkWeekSection } from "@/components/incidents/shared";

export function IncidentRatesSettingsClient() {
  return (
    <SettingsShell activeSection="incident-rates">
      <SiteWorkWeekSection />
    </SettingsShell>
  );
}
