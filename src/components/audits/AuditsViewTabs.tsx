"use client";

import { ModuleViewTabs } from "@/components/ui/ModuleViewTabs";

export type AuditsViewTabsProps = Readonly<{
  className?: string;
}>;

const TABS = [
  {
    href: "/dashboard/audits/dashboard",
    label: "Dashboard",
    icon: "mdi:view-dashboard-outline",
  },
  {
    href: "/dashboard/audits/list",
    label: "Audit list",
    icon: "mdi:format-list-bulleted",
  },
] as const;

export function AuditsViewTabs(props: Readonly<AuditsViewTabsProps>) {
  const { className = "" } = props;

  return (
    <ModuleViewTabs tabs={TABS} ariaLabel="Audit views" className={className} />
  );
}
