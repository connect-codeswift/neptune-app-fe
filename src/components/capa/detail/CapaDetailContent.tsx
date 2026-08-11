"use client";

import { useState } from "react";
import { CapaDetailHeader } from "@/components/capa/detail/CapaDetailHeader";
import { CapaDetailProgressCard } from "@/components/capa/detail/CapaDetailProgressCard";
import { CapaDetailSidebar } from "@/components/capa/detail/CapaDetailSidebar";
import { CapaDetailTabs } from "@/components/capa/detail/CapaDetailTabs";
import {
  CapaDetailAttachmentsTab,
  CapaDetailCommentsTab,
  CapaDetailDetailsTab,
  CapaDetailTasksTab,
} from "@/components/capa/detail/CapaDetailTabsPanels";
import type {
  CapaDetailRecord,
  CapaDetailTabId,
} from "@/components/capa/detail/capa-detail-data";

export type CapaDetailContentProps = Readonly<{
  record: CapaDetailRecord;
}>;

const tabPanelShellClass =
  "relative overflow-hidden rounded-tl-none rounded-tr-[14px] rounded-br-[14px] rounded-bl-[14px] border border-white/90 bg-white/62 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_0px_rgba(15,23,42,0.14)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']";

/** CAPA detail page — Figma 1366:2947 / tabs panel 1368:3178. */
export function CapaDetailContent(props: CapaDetailContentProps) {
  const { record } = props;
  const [activeTab, setActiveTab] = useState<CapaDetailTabId>("details");

  return (
    <div className="flex min-w-0 flex-col gap-3.5 px-4 pb-8">
      <CapaDetailHeader record={record} />
      <CapaDetailProgressCard record={record} />

      <div className="grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col">
          <CapaDetailTabs
            activeTab={activeTab}
            record={record}
            onTabChange={setActiveTab}
          />
          <div className={tabPanelShellClass}>
            <div className="relative z-1 min-w-0">
              {activeTab === "details" ? (
                <CapaDetailDetailsTab record={record} />
              ) : null}
              {activeTab === "tasks" ? (
                <CapaDetailTasksTab record={record} />
              ) : null}
              {activeTab === "comments" ? (
                <CapaDetailCommentsTab record={record} />
              ) : null}
              {activeTab === "attachments" ? (
                <CapaDetailAttachmentsTab record={record} />
              ) : null}
            </div>
          </div>
        </div>

        <CapaDetailSidebar record={record} />
      </div>
    </div>
  );
}
