"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CapaDashboardFilters } from "@/components/capa/CapaDashboardFilters";
import { CapaDashboardFooterCards } from "@/components/capa/CapaDashboardFooterCards";
import { CapaDashboardMetrics } from "@/components/capa/CapaDashboardMetrics";
import { CapaDetailPanel } from "@/components/capa/CapaDetailPanel";
import { CapaLifecycleCard } from "@/components/capa/CapaLifecycleCard";
import { CapaOpenedClosedCard } from "@/components/capa/CapaOpenedClosedCard";
import { CapaRegisterTable } from "@/components/capa/CapaRegisterTable";
import {
  CAPA_DASHBOARD_ITEMS,
  filterCapaDashboardItems,
} from "@/components/capa/capa-dashboard-data";

const CREATE_CAPA_ROUTE = "/dashboard/capa/new";
const MY_CAPAS_ROUTE = "/dashboard/capa/mine";

/** CAPA Dashboard main content — Figma 7123:41912. */
export function CapaDashboardView() {
  const router = useRouter();
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [selectedId, setSelectedId] = useState<string>(
    CAPA_DASHBOARD_ITEMS[0]?.id ?? "",
  );

  const filtered = useMemo(
    () =>
      filterCapaDashboardItems(CAPA_DASHBOARD_ITEMS, {
        status,
        type,
        mineOnly: false,
      }),
    [status, type],
  );

  const selected =
    filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  const openCapaDetail = (id: string) => {
    setSelectedId(id);
    router.push(`/dashboard/capa/${encodeURIComponent(id)}`);
  };

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <CapaDashboardMetrics />

      <div className="grid grid-cols-1 items-stretch gap-3.5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        <CapaLifecycleCard />
        <CapaOpenedClosedCard />
      </div>

      <CapaDashboardFilters
        status={status}
        type={type}
        shownCount={filtered.length}
        totalCount={CAPA_DASHBOARD_ITEMS.length}
        onStatusChange={setStatus}
        onTypeChange={setType}
        onMyCapas={() => router.push(MY_CAPAS_ROUTE)}
        onNewCapa={() => router.push(CREATE_CAPA_ROUTE)}
      />

      <div className="grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <CapaRegisterTable
          items={filtered}
          selectedId={selected?.id ?? null}
          onSelect={openCapaDetail}
        />
        {selected ? <CapaDetailPanel item={selected} /> : null}
      </div>

      <CapaDashboardFooterCards />
    </div>
  );
}
