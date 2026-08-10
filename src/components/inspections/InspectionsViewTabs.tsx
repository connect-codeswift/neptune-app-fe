"use client";

import { ModuleViewTabs } from "@/components/ui/ModuleViewTabs";

export type InspectionsViewTabsProps = Readonly<{
  className?: string;
}>;

const TABS = [
  {
    href: "/dashboard/inspections/dashboard",
    label: "Dashboard",
    icon: "mdi:view-dashboard-outline",
  },
  {
    href: "/dashboard/inspections/list",
    label: "Inspection list",
    icon: "mdi:format-list-bulleted",
  },
] as const;

export function InspectionsViewTabs(props: Readonly<InspectionsViewTabsProps>) {
  const { className = "" } = props;

  return (
    <ModuleViewTabs
      tabs={TABS}
      ariaLabel="Inspection views"
      className={className}
    />
  );
}
