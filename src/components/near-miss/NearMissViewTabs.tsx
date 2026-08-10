"use client";

import { ModuleViewTabs } from "@/components/ui/ModuleViewTabs";

export type NearMissViewTabsProps = Readonly<{
  className?: string;
}>;

const TABS = [
  {
    href: "/dashboard/near-miss/dashboard",
    label: "Dashboard",
    icon: "mdi:view-dashboard-outline",
  },
  {
    href: "/dashboard/near-miss/list",
    label: "Near miss list",
    icon: "mdi:format-list-bulleted",
  },
] as const;

export function NearMissViewTabs(props: Readonly<NearMissViewTabsProps>) {
  const { className = "" } = props;

  return (
    <ModuleViewTabs
      tabs={TABS}
      ariaLabel="Near miss views"
      className={className}
    />
  );
}
