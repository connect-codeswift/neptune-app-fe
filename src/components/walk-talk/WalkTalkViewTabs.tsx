"use client";

import { ModuleViewTabs } from "@/components/ui/ModuleViewTabs";

export type WalkTalkViewTabsProps = Readonly<{
  className?: string;
}>;

const TABS = [
  {
    href: "/dashboard/walk-talk/dashboard",
    label: "Dashboard",
    icon: "mdi:view-dashboard-outline",
  },
  {
    href: "/dashboard/walk-talk/list",
    label: "Session list",
    icon: "mdi:format-list-bulleted",
  },
] as const;

export function WalkTalkViewTabs(props: Readonly<WalkTalkViewTabsProps>) {
  const { className = "" } = props;

  return (
    <ModuleViewTabs
      tabs={TABS}
      ariaLabel="Walk & Talk views"
      className={className}
    />
  );
}
