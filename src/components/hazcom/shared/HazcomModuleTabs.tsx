"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type HazcomModuleTabsProps = Readonly<{
  className?: string;
}>;

export const HAZCOM_TABS = [
  { href: "/dashboard/hazcom/overview", label: "Overview" },
  { href: "/dashboard/hazcom/chemicals", label: "Chemical Inventory" },
  { href: "/dashboard/hazcom/sds", label: "SDS Library" },
  { href: "/dashboard/hazcom/training", label: "Training" },
  { href: "/dashboard/hazcom/risk-assessments", label: "Reports" },
] as const;

const SDS_LIBRARY_HREF = "/dashboard/hazcom/sds";
const LABELS_HREF = "/dashboard/hazcom/labels";

export function HazcomModuleTabs(props: Readonly<HazcomModuleTabsProps>) {
  const { className = "" } = props;
  const pathname = usePathname();

  return (
    <div
      className={[
        "flex gap-6 overflow-x-auto border-b border-[rgba(15,23,42,0.08)] px-1 whitespace-nowrap",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="tablist"
      aria-label="HazCom views"
    >
      {HAZCOM_TABS.map((tab) => {
        const isActive =
          pathname === tab.href ||
          pathname.startsWith(`${tab.href}/`) ||
          (tab.href === SDS_LIBRARY_HREF && pathname === LABELS_HREF);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            className={[
              "text4 border-b-2 py-2.5 font-semibold transition-all",
              isActive
                ? "border-ehs-normal-blue text-ehs-normal-blue"
                : "text-ehs-muted-text hover:text-ehs-gray border-transparent",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
