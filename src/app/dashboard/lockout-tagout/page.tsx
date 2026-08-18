"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  LotoActiveLockoutsSection,
  LotoEquipmentSection,
  LotoHistorySection,
  LotoMetricsSection,
  LotoModuleTabs,
  LotoPersonnelSection,
} from "@/components/loto";
import type { LotoTabId } from "@/app/dashboard/lockout-tagout/loto-data";
import { LOTO_PROCEDURE_CREATE_ROUTE } from "@/app/dashboard/lockout-tagout/loto-procedure-data";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useLotoDashboardKpisQuery } from "@/hooks/use-loto-queries";

const LOTO_TABS = [
  "equipment",
  "active-lockouts",
  "history",
  "personnel",
] as const satisfies readonly LotoTabId[];

function parseLotoTab(value: string | null): LotoTabId {
  if (value && (LOTO_TABS as readonly string[]).includes(value)) {
    return value as LotoTabId;
  }
  return "equipment";
}

export default function LockoutTagoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<LotoTabId>(() =>
    parseLotoTab(searchParams.get("tab")),
  );

  const hasToken = useHasAccessToken();
  const kpisQuery = useLotoDashboardKpisQuery(hasToken === true);
  const kpis = kpisQuery.data ?? null;

  const tabCounts: Partial<Record<LotoTabId, number>> = kpis
    ? {
        equipment: kpis.equipmentOnFile,
        "active-lockouts": kpis.activeLockouts,
        personnel: kpis.authorizedPersonnel,
      }
    : {};

  const handleTabChange = (tab: LotoTabId) => {
    setActiveTab(tab);
    const url =
      tab === "equipment"
        ? "/dashboard/lockout-tagout"
        : `/dashboard/lockout-tagout?tab=${tab}`;
    router.replace(url, { scroll: false });
  };

  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader title="Lockout / Tagout (LOTO)" />

      <div className="flex flex-1 flex-col gap-6 px-4 pb-8">
        <LotoModuleTabs
          activeTab={activeTab}
          counts={tabCounts}
          onTabChange={handleTabChange}
          onCreateProcedure={() => {
            router.push(LOTO_PROCEDURE_CREATE_ROUTE);
          }}
        />

        {activeTab === "equipment" ? (
          <>
            <LotoMetricsSection
              kpis={kpis}
              isLoading={hasToken === null || kpisQuery.isLoading}
              isError={kpisQuery.isError}
            />
            <LotoEquipmentSection />
          </>
        ) : null}

        {activeTab === "active-lockouts" ? <LotoActiveLockoutsSection /> : null}

        {activeTab === "history" ? <LotoHistorySection /> : null}

        {activeTab === "personnel" ? <LotoPersonnelSection /> : null}
      </div>
    </div>
  );
}
