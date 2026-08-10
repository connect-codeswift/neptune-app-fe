"use client";

import { ModuleViewTabs } from "@/components/ui/ModuleViewTabs";

export type IncidentViewTabsProps = Readonly<{
  className?: string;
}>;

const TABS = [
  {
    href: "/dashboard/incidents/dashboard",
    label: "Dashboard",
    icon: "mdi:view-dashboard-outline",
  },
  {
    href: "/dashboard/incidents/list",
    label: "Incident list",
    icon: "mdi:format-list-bulleted",
  },
] as const;

export function IncidentViewTabs(props: Readonly<IncidentViewTabsProps>) {
  const { className = "" } = props;

  return (
    <ModuleViewTabs
      tabs={TABS}
      ariaLabel="Incident views"
      className={className}
    />
  );
}
