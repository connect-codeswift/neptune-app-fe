"use client";

import { SettingsShell } from "@/components/settings/SettingsShell";
import { SiteWorkHoursSection } from "@/components/incidents/shared";

export function IncidentRatesSettingsClient() {
  return (
    <SettingsShell activeSection="incident-rates">
      <SiteWorkHoursSection />
    </SettingsShell>
  );
}
