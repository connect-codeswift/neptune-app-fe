"use client";

import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

function IncidentListViewFallback() {
  return (
    <IncidentGlassCard className="min-h-[240px] items-center justify-center gap-2">
      <Icon
        icon="mdi:loading"
        className="text-ehs-dark-blue size-7 animate-spin"
        aria-hidden="true"
      />
      <Text as="p" className="text-ehs-muted-text text-sm">
        Loading incidents…
      </Text>
    </IncidentGlassCard>
  );
}

/** Client-only mount — skips SSR to avoid auth/localStorage hydration mismatches. */
export const IncidentListViewClient = dynamic(
  () =>
    import("@/components/incidents/list/IncidentListView").then(
      (module) => module.IncidentListView,
    ),
  {
    ssr: false,
    loading: () => <IncidentListViewFallback />,
  },
);
