"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type IncidentViewTabsProps = Readonly<{
  className?: string;
}>;

const TABS = [
  {
    href: "/dashboard/incidents/dashboard",
    label: "Dashboard",
  },
  {
    href: "/dashboard/incidents/list",
    label: "Incident list",
  },
] as const;

/** Dashboard | Incident list — LOTO module tab styling. */
export function IncidentViewTabs(props: Readonly<IncidentViewTabsProps>) {
  const { className = "" } = props;
  const pathname = usePathname();

  return (
    <div
      className={[
        "border-ehs-border flex flex-wrap items-center justify-between gap-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className="flex min-w-0 flex-1 gap-0 overflow-x-auto"
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
                "inline-flex shrink-0 items-center gap-2.5 border-b-2 px-4 pt-2.5 pb-2.5 text-base whitespace-nowrap transition-colors",
                isActive
                  ? "border-ehs-normal-blue text-ehs-normal-blue font-semibold"
                  : "text-ehs-muted-text hover:text-ehs-gray border-transparent font-normal",
              ].join(" ")}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
