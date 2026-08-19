"use client";

import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { IH_AGENT_TYPES } from "@/components/industrial-hygiene/ih-dashboard-data";

/** Monitored Agent Types card — Figma 5298:22347. */
export function IhMonitoredAgentTypesCard() {
  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      className="min-w-0"
      incidentGlassCardClassName="gap-3"
    >
      <Text as="h2" className="text-base font-bold text-ehs-dark-bg">
        Monitored Agent Types
      </Text>

      <div className="flex flex-wrap gap-3">
        {IH_AGENT_TYPES.map((agent) => (
          <span
            key={agent.id}
            className={[
              "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2",
              agent.active
                ? "border-ehs-normal-blue/19 bg-ehs-normal-blue/6 text-ehs-normal-blue"
                : "border-ehs-border-ink/8 bg-ehs-surface/62 text-ehs-gray",
            ].join(" ")}
          >
            <Icon icon={agent.icon} className="size-5 shrink-0" aria-hidden />
            <span className="text-sm font-semibold">{agent.label}</span>
            <span
              className={[
                "text-sm font-extrabold",
                agent.active ? "text-ehs-normal-blue" : "text-ehs-dark-bg",
              ].join(" ")}
            >
              {String(agent.count)}
            </span>
          </span>
        ))}
      </div>
    </IncidentGlassCard>
  );
}
