"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type ModuleViewTab = Readonly<{
  href: string;
  label: string;
  icon: string;
}>;

export type ModuleViewTabsProps = Readonly<{
  tabs: readonly ModuleViewTab[];
  ariaLabel: string;
  className?: string;
}>;

/**
 * Dashboard | List switcher used across modules that have both a KPI view and a
 * register/list view. Active state is path-based so deep links stay correct.
 */
export function ModuleViewTabs(props: Readonly<ModuleViewTabsProps>) {
  const { tabs, ariaLabel, className = "" } = props;
  const pathname = usePathname();

  return (
    <div
      className={[
        "border-ehs-border inline-flex max-w-full shrink-0 gap-1 self-start overflow-x-auto rounded-xl border bg-white/60 p-[5px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            className={[
              "inline-flex w-fit items-center gap-[7px] rounded-[9px] px-4 py-[9px] text-sm font-bold transition-colors",
              isActive
                ? "bg-ehs-normal-blue text-ehs-light-text shadow-[0px_4px_12px_-4px_var(--ehs-normal-blue)]"
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
