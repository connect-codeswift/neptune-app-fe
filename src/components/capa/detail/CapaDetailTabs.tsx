"use client";

import { Icon } from "@iconify/react";
import {
  CAPA_DETAIL_TABS,
  type CapaDetailRecord,
  type CapaDetailTabId,
} from "@/components/capa/detail/capa-detail-data";

export type CapaDetailTabsProps = Readonly<{
  activeTab: CapaDetailTabId;
  record: CapaDetailRecord;
  onTabChange: (tab: CapaDetailTabId) => void;
}>;

/** Details / Tasks / Comments / Attachments tabs — Figma 1368:3179. */
export function CapaDetailTabs(props: CapaDetailTabsProps) {
  const { activeTab, record, onTabChange } = props;

  return (
    <div
      className="flex gap-0 overflow-x-auto border-b border-white/90"
      role="tablist"
      aria-label="CAPA detail views"
    >
      {CAPA_DETAIL_TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        const count =
          tab.countKey === "tasks"
            ? record.tasks.length
            : tab.countKey === "comments"
              ? record.comments.length
              : tab.countKey === "attachments"
                ? record.attachments.length
                : null;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={[
              "inline-flex shrink-0 cursor-pointer items-center gap-2.5 border-b-[1.5px] px-4 py-2.5 text-base whitespace-nowrap transition-colors",
              isActive
                ? "border-[#0891a6] font-medium text-[#0891a6]"
                : "border-transparent font-medium text-[#566072] hover:text-[#0b1320]",
            ].join(" ")}
          >
            <Icon icon={tab.icon} className="size-4 shrink-0" aria-hidden />
            {count != null ? `${tab.label} (${String(count)})` : tab.label}
          </button>
        );
      })}
    </div>
  );
}
