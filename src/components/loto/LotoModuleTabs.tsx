"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@iconify/react";
import {
  LOTO_TABS,
  type LotoTabId,
} from "@/app/dashboard/lockout-tagout/loto-data";

export type LotoModuleTabsProps = Readonly<{
  activeTab: LotoTabId;
  onTabChange: (tab: LotoTabId) => void;
  onCreateProcedure?: () => void;
}>;

/** Module tabs + Create Procedure — Figma 6835:39794. */
export function LotoModuleTabs(props: Readonly<LotoModuleTabsProps>) {
  const { activeTab, onTabChange, onCreateProcedure } = props;

  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[rgba(15,23,42,0.08)]">
      <div
        className="flex min-w-0 flex-1 gap-0 overflow-x-auto"
        role="tablist"
        aria-label="LOTO views"
      >
        {LOTO_TABS.map((tab) => {
          const isActive = tab.id === activeTab;

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
              <span
                className={[
                  "rounded-[10px] px-[7px] py-px text-[11px] font-semibold",
                  isActive
                    ? "bg-[rgba(8,145,166,0.12)] text-ehs-normal-blue"
                    : "bg-[rgba(15,23,42,0.07)] text-[#b3bbc8]",
                ].join(" ")}
              >
                {String(tab.count)}
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === "equipment" && onCreateProcedure ? (
        <Button
          type="button"
          variant="primary"
          onClick={onCreateProcedure}
          className="mb-1.5 shrink-0 gap-2 rounded-[10px] px-4 py-2 text-[13px] font-semibold shadow-[0px_4px_6px_rgba(8,145,166,0.24)]"
        >
          <Icon icon="mdi:file-document-outline" className="size-3.5 shrink-0" />
          Create Procedure
        </Button>
      ) : null}
    </div>
  );
}
