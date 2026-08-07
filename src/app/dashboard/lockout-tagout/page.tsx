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

      <div className="flex flex-1 flex-col gap-5 px-4 pb-8">
        <LotoModuleTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onCreateProcedure={() => {
            router.push(LOTO_PROCEDURE_CREATE_ROUTE);
          }}
        />

        {activeTab === "equipment" ? (
          <>
            <LotoMetricsSection />
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
