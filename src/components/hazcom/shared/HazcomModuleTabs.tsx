"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type HazcomModuleTabsProps = Readonly<{
  className?: string;
}>;

export const HAZCOM_TABS = [
  {
    href: "/hazcom/overview",
    label: "Overview",
    icon: "mdi:view-dashboard-outline",
  },
  {
    href: "/hazcom/chemicals",
    label: "Chemical Inventory",
    icon: "mdi:flask-outline",
  },
  {
    href: "/hazcom/sds",
    label: "SDS Library",
    icon: "mdi:file-document-outline",
  },
  {
    href: "/hazcom/training",
    label: "Training",
    icon: "mdi:school-outline",
  },
  {
    href: "/hazcom/risk-assessments",
    label: "Reports",
    icon: "mdi:chart-box-outline",
  },
] as const;

const SDS_LIBRARY_HREF = "/hazcom/sds";
const LABELS_HREF = "/hazcom/labels";

export function HazcomModuleTabs(props: Readonly<HazcomModuleTabsProps>) {
  const { className = "" } = props;
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
