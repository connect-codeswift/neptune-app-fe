"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type {
  ClosureLinkedCapaItem,
  IncidentClosureData,
} from "@/components/incidents/detail/incident-detail-types";

export type IncidentClosureStepPreventiveProps = Readonly<{
  data: IncidentClosureData;
  onChangeField: <K extends keyof IncidentClosureData>(
    field: K,
    value: IncidentClosureData[K]
  ) => void;
  onToggleCheckItem?: (itemId: string) => void;
  onLinkAdditionalCapa?: () => void;
}>;

function capaBadgeStyle(status: ClosureLinkedCapaItem["status"]) {
  switch (status) {
    case "Completed":
      return "bg-[#e6f7f5] text-[#008ba3]";
    case "In Progress":
      return "bg-[#eef2ff] text-[#4f46e5]";
    case "Planning":
    default:
      return "bg-[#f1f5f9] text-[#64748b]";
  }
}

export function IncidentClosureStepPreventive(
  props: Readonly<IncidentClosureStepPreventiveProps>
) {
  const { data, onChangeField, onLinkAdditionalCapa } = props;

  const linkedCapas = data.closureLinkedCapas ?? [];

  return (
    <div className="flex flex-col gap-6">
      <Text
        as="h2"
        className="text-[18px] leading-tight font-bold tracking-tight text-[#0f172a]"
      >
        Preventive Measures & CAPAs
      </Text>

      {/* Actions Taken */}
      <div className="flex flex-col">
        <label className="mb-2 text-[12px] font-bold tracking-[0.08em] uppercase text-[#94a3b8]">
          ACTIONS TAKEN
        </label>
        <textarea
          value={data.actionsTaken}
          onChange={(e) => onChangeField("actionsTaken", e.target.value)}
          rows={3}
          placeholder="Detail preventive actions taken..."
          className="w-full resize-y rounded-[14px] border border-[#e2e8f0] bg-white px-3.5 py-3 text-[13px] font-medium leading-[20px] text-[#1e293b] shadow-xs outline-none transition focus:border-[#008ba3] focus:ring-2 focus:ring-[#008ba3]/20"
        />
      </div>

      {/* Linked CAPAs */}
      <div className="flex flex-col">
        <label className="mb-2.5 text-[12px] font-bold tracking-[0.08em] uppercase text-[#94a3b8]">
          LINKED CAPAS
        </label>

        <div className="flex flex-col gap-3">
          {linkedCapas.map((capa) => (
            <div
              key={capa.id}
              className="flex items-center justify-between rounded-[14px] border border-[#e2e8f0] bg-white px-4 py-3.5 shadow-xs transition-all hover:border-[#cbd5e1]"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#d2eff4]/60 text-[#008ba3]">
                  <Icon icon="mdi:check-circle-outline" className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Text as="span" className="text-[13px] font-bold text-[#0f172a]">
                    {capa.title}
                  </Text>
                  <Text as="span" className="text-[12px] font-medium text-[#94a3b8]">
                    {capa.subtitle}
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-[6px] w-24 overflow-hidden rounded-full bg-[#e2e8f0]">
                  <div
                    className="h-full rounded-full bg-[#008ba3] transition-all duration-300"
                    style={{ width: `${String(capa.progressPercent)}%` }}
                  />
                </div>
                <span
                  className={[
                    "rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap",
                    capaBadgeStyle(capa.status),
                  ].join(" ")}
                >
                  {capa.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onLinkAdditionalCapa}
          className="mt-3 flex items-center gap-1.5 text-[13px] font-bold text-[#008ba3] transition-colors hover:underline"
        >
          <Icon icon="mdi:plus" className="size-4" />
          <span>Link additional CAPA or Action Item</span>
        </button>
      </div>
    </div>
  );
}
