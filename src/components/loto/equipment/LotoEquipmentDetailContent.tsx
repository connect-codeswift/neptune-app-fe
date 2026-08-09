"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  getActiveLockoutForEquipment,
  lotoApplyLockoutRoute,
  lotoRemoveLockoutRoute,
} from "@/app/dashboard/lockout-tagout/loto-lockout-data";
import {
  getLotoEquipmentDetail,
  type LotoEquipmentDetailTab,
} from "@/app/dashboard/lockout-tagout/loto-equipment-detail-data";
import { LOTO_ROUTE } from "@/app/dashboard/lockout-tagout/loto-procedure-data";
import { LotoEquipmentDetailHeader } from "./LotoEquipmentDetailHeader";
import { LotoEquipmentDetailTabs } from "./LotoEquipmentDetailTabs";
import { LotoEquipmentHistoryTab } from "./LotoEquipmentHistoryTab";
import { LotoEquipmentOverviewTab } from "./LotoEquipmentOverviewTab";
import { LotoEquipmentProcedureTab } from "./LotoEquipmentProcedureTab";

function parseTab(value: string | null | undefined): LotoEquipmentDetailTab {
  if (value === "procedure" || value === "history") return value;
  return "overview";
}

export type LotoEquipmentDetailContentProps = Readonly<{
  equipmentId: string;
  initialTab?: string | null;
}>;

export function LotoEquipmentDetailContent(
  props: LotoEquipmentDetailContentProps,
) {
  const { equipmentId, initialTab } = props;
  const router = useRouter();
  const detail = useMemo(
    () => getLotoEquipmentDetail(equipmentId),
    [equipmentId],
  );
  const [activeTab, setActiveTab] = useState<LotoEquipmentDetailTab>(() =>
    parseTab(initialTab),
  );

  if (!detail) {
    return (
      <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
        <IncidentGlassCard paddingClassName="p-6" className="min-w-0">
          <Text as="p" className="text-ehs-darker text-sm font-semibold">
            Equipment not found
          </Text>
          <Text as="p" className="text-ehs-muted-text mt-1 text-sm">
            {`No equipment matches “${equipmentId}”.`}
          </Text>
          <Link
            href={LOTO_ROUTE}
            className="text-ehs-normal-blue mt-3 inline-block text-sm hover:underline"
          >
            Back to LOTO
          </Link>
        </IncidentGlassCard>
      </div>
    );
  }

  const handleTabChange = (tab: LotoEquipmentDetailTab) => {
    setActiveTab(tab);
    const url =
      tab === "overview"
        ? `/dashboard/lockout-tagout/equipment/${equipmentId}`
        : `/dashboard/lockout-tagout/equipment/${equipmentId}?tab=${tab}`;
    router.replace(url, { scroll: false });
  };

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      <LotoEquipmentDetailHeader
        detail={detail}
        isLockedOut={detail.status === "Locked Out"}
        onApplyLockout={() => {
          const active = getActiveLockoutForEquipment(equipmentId);
          if (detail.status === "Locked Out" && active) {
            router.push(lotoRemoveLockoutRoute(active.id));
            return;
          }
          router.push(lotoApplyLockoutRoute(equipmentId));
        }}
      />

      <LotoEquipmentDetailTabs
        activeTab={activeTab}
        historyCount={detail.history.length}
        onTabChange={handleTabChange}
      />

      {activeTab === "overview" ? (
        <LotoEquipmentOverviewTab
          detail={detail}
          onManagePersonnel={() => {
            router.push(`${LOTO_ROUTE}?tab=personnel`);
          }}
          onViewAllHistory={() => {
            handleTabChange("history");
          }}
        />
      ) : null}

      {activeTab === "procedure" ? (
        <LotoEquipmentProcedureTab detail={detail} />
      ) : null}

      {activeTab === "history" ? (
        <LotoEquipmentHistoryTab history={detail.history} />
      ) : null}
    </div>
  );
}
