"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  PpeInventorySection,
  PpeMetricsSection,
} from "@/components/ppe";
import { PpeManagementActions } from "@/components/ppe/PpeManagementActions";
import { PpeIssuanceLogContent } from "@/components/ppe/log/PpeIssuanceLogContent";
import { canManagePpeInventory } from "@/lib/current-user";

export default function PpeManagementPage() {
  // Resolve role after mount — the JWT lives in localStorage.
  const [canManageInventory, setCanManageInventory] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time role read from localStorage token
    setCanManageInventory(canManagePpeInventory());
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader
        title="PPE Management"
        searchPlaceholder="Search incidents, actions, docs..."
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      <div className="flex flex-1 flex-col gap-4.5 px-3 pb-8 sm:px-4">
        <PpeMetricsSection />

        {canManageInventory === true ? <PpeInventorySection /> : null}

        {canManageInventory === false ? (
          <>
            <PpeManagementActions showViewIssues={false} />
            <PpeIssuanceLogContent embedded />
          </>
        ) : null}
      </div>
    </div>
  );
}
