"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@iconify/react";
import {
  LOTO_TABS,
  type LotoTabId,
} from "@/app/dashboard/lockout-tagout/loto-data";
import {
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_ACTION_ICON_CLASS,
} from "@/components/ui/table-header-action";

export type LotoModuleTabsProps = Readonly<{
  activeTab: LotoTabId;
  onTabChange: (tab: LotoTabId) => void;
  onCreateProcedure?: () => void;
}>;

/** Module tabs + Create Procedure — Figma 6835:39794. */
export function LotoModuleTabs(props: Readonly<LotoModuleTabsProps>) {
  const { activeTab, onTabChange, onCreateProcedure } = props;

  return (
    <div className="border-ehs-border flex flex-wrap items-center justify-between gap-3">
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
                "inline-flex shrink-0 cursor-pointer items-center gap-2.5 border-b-2 px-4 pt-2.5 pb-2.5 text-base whitespace-nowrap transition-colors",
                isActive
                  ? "border-ehs-normal-blue text-ehs-normal-blue font-semibold"
                  : "text-ehs-muted-text hover:text-ehs-gray border-transparent font-normal",
              ].join(" ")}
            >
              {tab.label}
              <span
                className={[
                  "rounded-lg px-2 py-px text-xs font-semibold",
                  isActive
                    ? "bg-ehs-normal-blue/10 text-ehs-normal-blue"
                    : "bg-slate-900/5 text-slate-400",
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
          className={TABLE_HEADER_ACTION_CLASS}
        >
          <Icon
            icon="mdi:file-document-outline"
            className={TABLE_HEADER_ACTION_ICON_CLASS}
            aria-hidden="true"
          />
          Create Procedure
        </Button>
      ) : null}
    </div>
  );
}
