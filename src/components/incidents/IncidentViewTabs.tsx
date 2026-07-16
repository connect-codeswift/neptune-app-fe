"use client";

import { Icon } from "@iconify/react";

export type IncidentView = "dashboard" | "list";

export type IncidentViewTabsProps = Readonly<{
  activeView?: IncidentView;
  onViewChange?: (view: IncidentView) => void;
  className?: string;
}>;

const TABS = [
  {
    id: "dashboard" as const,
    label: "Dashboard",
    icon: "mdi:view-dashboard-outline",
  },
  {
    id: "list" as const,
    label: "Incident list",
    icon: "mdi:format-list-bulleted",
  },
] as const;

export function IncidentViewTabs(props: Readonly<IncidentViewTabsProps>) {
  const { activeView = "dashboard", onViewChange, className = "" } = props;

  return (
    <div
      className={[
        "inline-flex w-fit shrink-0 gap-1 self-start rounded-xl border border-[rgba(15,23,42,0.08)] bg-white/60 p-[5px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="tablist"
      aria-label="Incident views"
    >
      {TABS.map((tab) => {
        const isActive = activeView === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onViewChange?.(tab.id)}
            className={[
              "inline-flex w-fit items-center gap-[7px] rounded-[9px] px-4 py-[9px] text-[13px] font-bold transition-colors",
              isActive
                ? "bg-ehs-normal-blue text-ehs-light-text shadow-[0px_4px_12px_-4px_#0891a6]"
                : "text-ehs-gray hover:bg-white/70",
            ].join(" ")}
          >
            <Icon icon={tab.icon} className="text-sm" aria-hidden="true" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
