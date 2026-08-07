"use client";

import { ModuleViewTabs } from "@/components/ui/ModuleViewTabs";

export type PpeViewTabsProps = Readonly<{
  className?: string;
}>;

const TABS = [
  {
    href: "/dashboard/ppe-management/dashboard",
    label: "Dashboard",
    icon: "mdi:view-dashboard-outline",
  },
  {
    href: "/dashboard/ppe-management/list",
    label: "Inventory list",
    icon: "mdi:format-list-bulleted",
  },
] as const;

export function PpeViewTabs(props: Readonly<PpeViewTabsProps>) {
  const { className = "" } = props;

  return (
    <ModuleViewTabs
      tabs={TABS}
      ariaLabel="PPE management views"
      className={className}
    />
  );
}
