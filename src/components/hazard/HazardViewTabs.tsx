"use client";

import { ModuleViewTabs } from "@/components/ui/ModuleViewTabs";

export type HazardViewTabsProps = Readonly<{
  className?: string;
}>;

const TABS = [
  {
    href: "/dashboard/hazard/dashboard",
    label: "Dashboard",
    icon: "mdi:view-dashboard-outline",
  },
  {
    href: "/dashboard/hazard/list",
    label: "Hazard list",
    icon: "mdi:format-list-bulleted",
  },
] as const;

export function HazardViewTabs(props: Readonly<HazardViewTabsProps>) {
  const { className = "" } = props;

  return (
    <ModuleViewTabs
      tabs={TABS}
      ariaLabel="Hazard views"
      className={className}
    />
  );
}
