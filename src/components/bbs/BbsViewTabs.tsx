"use client";

import { ModuleViewTabs } from "@/components/ui/ModuleViewTabs";

export type BbsViewTabsProps = Readonly<{
  className?: string;
}>;

const TABS = [
  {
    href: "/dashboard/bbs/dashboard",
    label: "Dashboard",
    icon: "mdi:view-dashboard-outline",
  },
  {
    href: "/dashboard/bbs/list",
    label: "Observation list",
    icon: "mdi:format-list-bulleted",
  },
] as const;

export function BbsViewTabs(props: Readonly<BbsViewTabsProps>) {
  const { className = "" } = props;

  return (
    <ModuleViewTabs tabs={TABS} ariaLabel="BBS views" className={className} />
  );
}
