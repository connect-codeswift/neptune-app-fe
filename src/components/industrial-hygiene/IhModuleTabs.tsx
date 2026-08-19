"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IH_MODULE_TABS } from "@/components/industrial-hygiene/ih-dashboard-data";

export type IhModuleTabsProps = Readonly<{
  className?: string;
}>;

/** Module tabs — Figma 5298:22246. */
export function IhModuleTabs(props: Readonly<IhModuleTabsProps>) {
  const { className = "" } = props;
  const pathname = usePathname();

  return (
    <div
      className={[
        "flex gap-2 overflow-x-auto border-b border-ehs-border-ink/8 whitespace-nowrap",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="tablist"
      aria-label="Industrial Hygiene views"
    >
      {IH_MODULE_TABS.map((tab) => {
        const isActive =
          tab.href === IH_MODULE_TABS[0].href
            ? pathname === tab.href || pathname === `${tab.href}/`
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.id}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            className={[
              "shrink-0 border-b-2 px-4 py-2 text-base transition-colors",
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
  );
}
