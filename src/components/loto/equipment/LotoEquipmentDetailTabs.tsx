"use client";

import {
  LOTO_EQUIPMENT_DETAIL_TABS,
  type LotoEquipmentDetailTab,
} from "@/app/dashboard/lockout-tagout/loto-equipment-detail-data";

export type LotoEquipmentDetailTabsProps = Readonly<{
  activeTab: LotoEquipmentDetailTab;
  historyCount: number;
  onTabChange: (tab: LotoEquipmentDetailTab) => void;
}>;

/** Overview / Procedure / History tabs — Figma 6888:50991. */
export function LotoEquipmentDetailTabs(props: LotoEquipmentDetailTabsProps) {
  const { activeTab, historyCount, onTabChange } = props;

  return (
    <div
      className="flex gap-0 border-b border-[rgba(15,23,42,0.08)]"
      role="tablist"
      aria-label="Equipment detail views"
    >
      {LOTO_EQUIPMENT_DETAIL_TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        const showCount = tab.id === "history";

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
              "text4 inline-flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 px-4.5 pt-2.5 pb-2.75 whitespace-nowrap transition-colors",
              isActive
                ? "border-ehs-normal-blue text-ehs-normal-blue font-semibold"
                : "border-transparent font-normal text-[#8892a3] hover:text-[#566072]",
            ].join(" ")}
          >
            {tab.label}
            {showCount ? (
              <span
                className={[
                  "text8 rounded-2.5 px-1.75 py-px font-semibold",
                  isActive
                    ? "text-ehs-normal-blue bg-[rgba(8,145,166,0.12)]"
                    : "bg-[rgba(15,23,42,0.07)] text-[#b3bbc8]",
                ].join(" ")}
              >
                {String(historyCount)}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
