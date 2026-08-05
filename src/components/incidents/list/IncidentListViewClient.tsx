"use client";

import dynamic from "next/dynamic";
import { SkeletonListPage } from "@/components/ui/skeletons";

/** Client-only mount — skips SSR to avoid auth/localStorage hydration mismatches. */
export const IncidentListViewClient = dynamic(
  () =>
    import("@/components/incidents/list/IncidentListView").then(
      (module) => module.IncidentListView,
    ),
  {
    ssr: false,
    // Mirrors IncidentListView's own layout (KPI row, filter bar, table) so the
    // page doesn't reflow when the chunk arrives.
    loading: () => (
      <SkeletonListPage kpis={4} filters={2} rows={8} columns={5} />
    ),
  },
);
