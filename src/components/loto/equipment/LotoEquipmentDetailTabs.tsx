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
              "inline-flex shrink-0 cursor-pointer items-center gap-1.5 border-b-[1.5px] px-[18px] pt-2.5 pb-[11px] text-[13px] whitespace-nowrap transition-colors",
              isActive
                ? "border-ehs-normal-blue text-ehs-normal-blue font-semibold"
                : "border-transparent font-normal text-[#8892a3] hover:text-[#566072]",
            ].join(" ")}
          >
            {tab.label}
            {showCount ? (
              <span
                className={[
                  "rounded-[10px] px-[7px] py-px text-[11px] font-semibold",
                  isActive
                    ? "bg-[rgba(8,145,166,0.12)] text-ehs-normal-blue"
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
