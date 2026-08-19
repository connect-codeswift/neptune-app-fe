"use client";

import Link from "next/link";
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
import type { CapaDetailTabId } from "@/components/capa/detail/capa-detail-data";
import { CapaDetailSkeleton } from "@/components/capa/CapaRouteSkeletons";
import { Text } from "@/components/Text";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCapaDetailQuery } from "@/hooks/use-capa-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";

const CAPA_ROUTE = "/dashboard/capa";

export type CapaDetailContentProps = Readonly<{
  /** Route param — numeric CAPA id (e.g. `"1"`). */
  capaId: string;
}>;

const tabPanelShellClass =
  "relative overflow-hidden rounded-tl-none rounded-tr-3.5 rounded-br-3.5 rounded-bl-3.5 border border-ehs-hairline/90 bg-ehs-surface/62 shadow-(--ehs-shadow-panel) backdrop-blur-2.5 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:content-['']";

function parseRouteCapaId(capaId: string): number | null {
  const parsed = Number.parseInt(decodeURIComponent(capaId).trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** CAPA detail page — Figma 1366:2947 / tabs panel 1368:3178. */
export function CapaDetailContent(props: CapaDetailContentProps) {
  const { capaId: capaIdParam } = props;
  const numericId = parseRouteCapaId(capaIdParam);
  const hasToken = useHasAccessToken();
  const [activeTab, setActiveTab] = useState<CapaDetailTabId>("details");

  const detailQuery = useCapaDetailQuery({
    capaId: numericId,
    enabled: hasToken === true && numericId != null,
  });
  const isLoading =
    hasToken === null ||
    (hasToken === true &&
      numericId != null &&
      (detailQuery.isLoading ||
        (detailQuery.isFetching && detailQuery.data === undefined)));

  if (numericId == null) {
    return (
      <div className="flex min-w-0 flex-col gap-2 px-4 pb-8">
        <Text as="p" className="text-ehs-muted-text text-sm">
          That CAPA could not be found.
        </Text>
        <Link
          href={CAPA_ROUTE}
          className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover text-sm transition-colors"
        >
          Back to CAPA
        </Link>
      </div>
    );
  }

  if (hasToken === false) {
    return (
      <div className="flex min-w-0 flex-col gap-2 px-4 pb-8">
        <Text as="p" className="text-ehs-muted-text text-sm">
          Sign in to view this CAPA.
        </Text>
        <Link
          href={CAPA_ROUTE}
          className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover text-sm transition-colors"
        >
          Back to CAPA
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <CapaDetailSkeleton />;
  }

  if (detailQuery.isError) {
    return (
      <div className="flex min-w-0 flex-col gap-2 px-4 pb-8">
        <Text as="p" className="text-ehs-red text-sm">
          {getMutationErrorMessage(
            detailQuery.error,
            "Could not load this CAPA.",
          )}
        </Text>
        <Link
          href={CAPA_ROUTE}
          className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover text-sm transition-colors"
        >
          Back to CAPA
        </Link>
      </div>
    );
  }

  const record = detailQuery.data;
  if (!record) {
    return (
      <div className="flex min-w-0 flex-col gap-2 px-4 pb-8">
        <Text as="p" className="text-ehs-muted-text text-sm">
          That CAPA could not be found.
        </Text>
        <Link
          href={CAPA_ROUTE}
          className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover text-sm transition-colors"
        >
          Back to CAPA
        </Link>
      </div>
    );
  }

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
