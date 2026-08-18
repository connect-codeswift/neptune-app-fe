"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  lotoApplyLockoutRoute,
  lotoRemoveLockoutRoute,
} from "@/app/dashboard/lockout-tagout/loto-lockout-data";
import { type LotoEquipmentDetailTab } from "@/app/dashboard/lockout-tagout/loto-equipment-detail-data";
import {
  LOTO_ROUTE,
  lotoProcedureEditRoute,
} from "@/app/dashboard/lockout-tagout/loto-procedure-data";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import {
  useLotoEquipmentDetailQuery,
  useLotoEquipmentHistoryQuery,
} from "@/hooks/use-loto-queries";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { toLotoEquipmentDetail } from "@/services/mappers/loto.mapper";
import { LotoQueryStatus } from "../LotoQueryStatus";
import { LotoEquipmentDetailHeader } from "./LotoEquipmentDetailHeader";
import { LotoEquipmentDetailTabs } from "./LotoEquipmentDetailTabs";
import { LotoEquipmentHistoryTab } from "./LotoEquipmentHistoryTab";
import { LotoEquipmentOverviewTab } from "./LotoEquipmentOverviewTab";
import { LotoEquipmentProcedureTab } from "./LotoEquipmentProcedureTab";

function parseTab(value: string | null | undefined): LotoEquipmentDetailTab {
  if (value === "procedure" || value === "history") return value;
  return "overview";
}

function toNumericId(idParam: string): number | null {
  const trimmed = idParam.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
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
  const hasToken = useHasAccessToken();
  const numericId = toNumericId(equipmentId);

  const [activeTab, setActiveTab] = useState<LotoEquipmentDetailTab>(() =>
    parseTab(initialTab),
  );

  const detailQuery = useLotoEquipmentDetailQuery(numericId, hasToken === true);
  const historyQuery = useLotoEquipmentHistoryQuery(
    numericId,
    hasToken === true,
  );

  const detail = useMemo(() => {
    if (!detailQuery.data) return null;
    return toLotoEquipmentDetail(detailQuery.data, historyQuery.data ?? []);
  }, [detailQuery.data, historyQuery.data]);

  if (numericId === null) {
    return <EquipmentNotFound equipmentId={equipmentId} />;
  }

  const isLoading =
    hasToken === null ||
    (hasToken && (detailQuery.isLoading || historyQuery.isLoading));

  if (isLoading) {
    return <LotoQueryStatus state="loading" />;
  }

  if (detailQuery.isError) {
    return (
      <LotoQueryStatus
        state="error"
        message={getMutationErrorMessage(
          detailQuery.error,
          "Failed to load this equipment.",
        )}
      />
    );
  }

  if (!detail) {
    return <EquipmentNotFound equipmentId={equipmentId} />;
  }

  const handleTabChange = (tab: LotoEquipmentDetailTab) => {
    setActiveTab(tab);
    const url =
      tab === "overview"
        ? `/dashboard/lockout-tagout/equipment/${equipmentId}`
        : `/dashboard/lockout-tagout/equipment/${equipmentId}?tab=${tab}`;
    router.replace(url, { scroll: false });
  };

  const isLockedOut = detail.status === "Locked Out";
  const activeLockout = detail.history.find((row) => row.result === "Active");

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      <LotoEquipmentDetailHeader
        detail={detail}
        isLockedOut={isLockedOut}
        onEdit={() => {
          router.push(lotoProcedureEditRoute(numericId));
        }}
        onApplyLockout={() => {
          if (isLockedOut && activeLockout) {
            router.push(lotoRemoveLockoutRoute(activeLockout.id));
            return;
          }
          router.push(lotoApplyLockoutRoute(numericId));
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

function EquipmentNotFound(props: Readonly<{ equipmentId: string }>) {
  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      <IncidentGlassCard paddingClassName="p-6" className="min-w-0">
        <Text as="p" className="text4 text-ehs-darker font-semibold">
          Equipment not found
        </Text>
        <Text as="p" className="text4 text-ehs-muted-text mt-1">
          {`No equipment matches “${props.equipmentId}”.`}
        </Text>
        <Link
          href={LOTO_ROUTE}
          className="text4 text-ehs-normal-blue mt-3 inline-block hover:underline"
        >
          Back to LOTO
        </Link>
      </IncidentGlassCard>
    </div>
  );
}
