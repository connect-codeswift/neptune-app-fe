"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type IncidentViewTabsProps = Readonly<{
  className?: string;
}>;

const TABS = [
  {
    href: "/incidents/dashboard",
    label: "Dashboard",
    icon: "mdi:view-dashboard-outline",
  },
  {
    href: "/incidents/list",
    label: "Incident list",
    icon: "mdi:format-list-bulleted",
  },
] as const;

export function IncidentViewTabs(props: Readonly<IncidentViewTabsProps>) {
  const { className = "" } = props;
  const pathname = usePathname();

  return (
    <div
      className={[
        "inline-flex max-w-full shrink-0 gap-1 self-start overflow-x-auto rounded-xl border border-[rgba(15,23,42,0.08)] bg-white/60 p-[5px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="tablist"
      aria-label="Incident views"
    >
      {TABS.map((tab) => {
        const isActive =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            className={[
              "inline-flex w-fit items-center gap-[7px] rounded-[9px] px-4 py-[9px] text-[13px] font-bold transition-colors",
              isActive
                ? "bg-ehs-normal-blue text-ehs-light-text shadow-[0px_4px_12px_-4px_#0891a6]"
                : "text-ehs-gray hover:bg-white/70",
            ].join(" ")}
          >
            <Icon icon={tab.icon} className="text-sm" aria-hidden="true" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
