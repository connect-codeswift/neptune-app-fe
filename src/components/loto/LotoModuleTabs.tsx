"use client";

import { Text } from "@/components/Text";
import {
  LOTO_TABS,
  type LotoTabId,
} from "@/app/dashboard/lockout-tagout/loto-data";

export type LotoModuleTabsProps = Readonly<{
  activeTab: LotoTabId;
  /** Live counts per tab; a tab with no count yet renders no badge. */
  counts?: Partial<Record<LotoTabId, number>>;
  onTabChange: (tab: LotoTabId) => void;
}>;

/** Module tabs for the LOTO dashboard views. */
export function LotoModuleTabs(props: Readonly<LotoModuleTabsProps>) {
  const { activeTab, counts = {}, onTabChange } = props;

  return (
    <div className="border-ehs-border flex flex-wrap items-center justify-between gap-3">
      <div
        className="flex min-w-0 flex-1 gap-0 overflow-x-auto"
        role="tablist"
        aria-label="LOTO views"
      >
        {LOTO_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const count = counts[tab.id];

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                onTabChange(tab.id);
              }}
              className={[
                "inline-flex shrink-0 cursor-pointer items-center gap-2.5 border-b-2 px-4 pt-2.5 pb-2.5 whitespace-nowrap transition-colors",
                isActive
                  ? "border-ehs-normal-blue text-ehs-normal-blue"
                  : "text-ehs-muted-text hover:text-ehs-gray border-transparent",
              ].join(" ")}
            >
              <Text
                as="span"
                className={[
                  "text4",
                  isActive ? "font-semibold" : "font-normal",
                ].join(" ")}
              >
                {tab.label}
              </Text>
              {count !== undefined ? (
                <Text
                  as="span"
                  className={[
                    "text8 rounded-lg px-2 py-px font-semibold",
                    isActive
                      ? "bg-ehs-normal-blue/10 text-ehs-normal-blue"
                      : "bg-ehs-dark-bg/8 text-ehs-muted-text",
                  ].join(" ")}
                >
                  {String(count)}
                </Text>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
