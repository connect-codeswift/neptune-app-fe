"use client";

import { Icon } from "@iconify/react";
import {
  CAPA_DETAIL_TABS,
  type CapaDetailRecord,
  type CapaDetailTabId,
} from "@/components/capa/detail/capa-detail-data";
import {
  useCapaAttachmentsQuery,
  useCapaCommentsQuery,
  useCapaTasksQuery,
} from "@/hooks/use-capa-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";

export type CapaDetailTabsProps = Readonly<{
  activeTab: CapaDetailTabId;
  record: CapaDetailRecord;
  onTabChange: (tab: CapaDetailTabId) => void;
}>;

/** Details / Tasks / Comments / Attachments tabs — Figma 1368:3179. */
export function CapaDetailTabs(props: CapaDetailTabsProps) {
  const { activeTab, record, onTabChange } = props;
  const hasToken = useHasAccessToken();
  const tasksQuery = useCapaTasksQuery({
    capaId: record.numericId > 0 ? record.numericId : null,
    enabled: hasToken === true && record.numericId > 0,
  });
  const commentsQuery = useCapaCommentsQuery({
    capaId: record.numericId > 0 ? record.numericId : null,
    userId: record.userId,
    assignedId: record.assignedId,
    enabled: hasToken === true && record.numericId > 0,
  });
  const attachmentsQuery = useCapaAttachmentsQuery({
    capaId: record.numericId > 0 ? record.numericId : null,
    enabled: hasToken === true && record.numericId > 0,
  });
  const taskCount = tasksQuery.data?.length ?? record.tasks.length;
  const commentCount = commentsQuery.data?.length ?? record.comments.length;
  const attachmentCount =
    attachmentsQuery.data?.length ?? record.attachments.length;

  return (
    <div
      className="border-ehs-hairline/90 flex gap-0 overflow-x-auto border-b"
      role="tablist"
      aria-label="CAPA detail views"
    >
      {CAPA_DETAIL_TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        const count =
          tab.countKey === "tasks"
            ? taskCount
            : tab.countKey === "comments"
              ? commentCount
              : tab.countKey === "attachments"
                ? attachmentCount
                : null;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={[
              "inline-flex shrink-0 cursor-pointer items-center gap-2.5 border-b-2 px-4 py-2.5 text-base whitespace-nowrap transition-colors",
              isActive
                ? "border-ehs-normal-blue text-ehs-normal-blue font-medium"
                : "text-ehs-gray hover:text-ehs-dark-bg border-transparent font-medium",
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
