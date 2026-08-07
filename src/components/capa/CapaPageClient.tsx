"use client";

import { useRouter } from "next/navigation";
import { CapaDashboardView } from "@/components/capa/CapaDashboardView";
import { DashboardHeader } from "@/components/DashboardHeader";

const CREATE_CAPA_ROUTE = "/dashboard/capa/new";

/** CAPA Dashboard page shell — Figma 7123:41912. */
export function CapaPageClient() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <DashboardHeader
        title="CAPA Dashboard"
        actionLabel="New CAPA"
        onActionClick={() => router.push(CREATE_CAPA_ROUTE)}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-4 pb-8">
        <CapaDashboardView />
      </div>
    </div>
  );
}
