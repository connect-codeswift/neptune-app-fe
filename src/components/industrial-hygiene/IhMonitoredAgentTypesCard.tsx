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
      <Text as="h2" className="text-base font-bold text-[#0b1320]">
        Monitored Agent Types
      </Text>

      <div className="flex flex-wrap gap-3">
        {IH_AGENT_TYPES.map((agent) => (
          <span
            key={agent.id}
            className={[
              "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2",
              agent.active
                ? "border-[rgba(8,145,166,0.19)] bg-[rgba(8,145,166,0.06)] text-[#0891a6]"
                : "border-[rgba(15,23,42,0.08)] bg-white/62 text-[#566072]",
            ].join(" ")}
          >
            <Icon icon={agent.icon} className="size-5 shrink-0" aria-hidden />
            <span className="text-sm font-semibold">{agent.label}</span>
            <span
              className={[
                "text-sm font-extrabold",
                agent.active ? "text-[#0891a6]" : "text-[#0b1320]",
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
