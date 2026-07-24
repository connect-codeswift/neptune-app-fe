"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { IncidentClosureData } from "@/components/incidents/detail/incident-detail-types";

export type IncidentClosureStepClassificationProps = Readonly<{
  data: IncidentClosureData;
  onChangeField: <K extends keyof IncidentClosureData>(
    field: K,
    value: IncidentClosureData[K]
  ) => void;
}>;

const INCIDENT_TYPES = [
  "Lost Time",
  "First Aid",
  "Near Miss",
  "Medical Treatment",
  "Property Damage",
  "Environmental Release",
];

const SIF_CLASSIFICATIONS = ["Potential SIF", "SIF", "Non-SIF"];

export function IncidentClosureStepClassification(
  props: Readonly<IncidentClosureStepClassificationProps>
) {
  const { data, onChangeField } = props;

  return (
    <div className="flex flex-col gap-6">
      <Text
        as="h2"
        className="text-[18px] leading-tight font-bold tracking-tight text-[#0f172a]"
      >
        Closure Classification
      </Text>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Final Incident Type */}
        <div className="flex flex-col">
          <label className="mb-2 text-[12px] font-bold tracking-[0.08em] uppercase text-[#94a3b8]">
            FINAL INCIDENT TYPE
          </label>
          <div className="relative">
            <select
              value={data.finalIncidentType}
              onChange={(e) => onChangeField("finalIncidentType", e.target.value)}
              className="w-full appearance-none rounded-[14px] border border-[#e2e8f0] bg-white py-2.5 pr-9 pl-3.5 text-[13px] font-semibold text-[#0f172a] shadow-xs outline-none transition focus:border-[#008ba3] focus:ring-2 focus:ring-[#008ba3]/20"
            >
              {INCIDENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <Icon
              icon="mdi:chevron-down"
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[18px] text-[#64748b]"
            />
          </div>
          <span className="mt-2 text-[12px] font-normal text-[#94a3b8]">
            Defaults from intake - verify before closing
          </span>
        </div>

        {/* SIF Classification */}
        <div className="flex flex-col">
          <label className="mb-2 text-[12px] font-bold tracking-[0.08em] uppercase text-[#94a3b8]">
            SIF CLASSIFICATION
          </label>
          <div className="relative">
            <select
              value={data.sifClassification}
              onChange={(e) => onChangeField("sifClassification", e.target.value)}
              className="w-full appearance-none rounded-[14px] border border-[#e2e8f0] bg-white py-2.5 pr-9 pl-3.5 text-[13px] font-semibold text-[#0f172a] shadow-xs outline-none transition focus:border-[#008ba3] focus:ring-2 focus:ring-[#008ba3]/20"
            >
              {SIF_CLASSIFICATIONS.map((sif) => (
                <option key={sif} value={sif}>
                  {sif}
                </option>
              ))}
            </select>
            <Icon
              icon="mdi:chevron-down"
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[18px] text-[#64748b]"
            />
          </div>
        </div>

        {/* Days Away From Work */}
        <div className="flex flex-col">
          <label className="mb-2 text-[12px] font-bold tracking-[0.08em] uppercase text-[#94a3b8]">
            DAYS AWAY FROM WORK
          </label>
          <input
            type="number"
            min={0}
            value={data.daysAwayFromWork}
            onChange={(e) =>
              onChangeField("daysAwayFromWork", Math.max(0, parseInt(e.target.value || "0", 10)))
            }
            className="w-full rounded-[14px] border border-[#e2e8f0] bg-white px-3.5 py-2.5 text-[13px] font-bold text-[#0f172a] shadow-xs outline-none transition focus:border-[#008ba3] focus:ring-2 focus:ring-[#008ba3]/20"
          />
        </div>

        {/* Days On Restricted Duty */}
        <div className="flex flex-col">
          <label className="mb-2 text-[12px] font-bold tracking-[0.08em] uppercase text-[#94a3b8]">
            DAYS ON RESTRICTED DUTY
          </label>
          <input
            type="number"
            min={0}
            value={data.daysOnRestrictedDuty}
            onChange={(e) =>
              onChangeField("daysOnRestrictedDuty", Math.max(0, parseInt(e.target.value || "0", 10)))
            }
            className="w-full rounded-[14px] border border-[#e2e8f0] bg-white px-3.5 py-2.5 text-[13px] font-bold text-[#0f172a] shadow-xs outline-none transition focus:border-[#008ba3] focus:ring-2 focus:ring-[#008ba3]/20"
          />
        </div>
      </div>

      {/* Recordable Under OSHA */}
      <div className="flex flex-col gap-2 pt-2">
        <label className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#94a3b8]">
          RECORDABLE UNDER OSHA
        </label>
        <div className="flex items-center gap-6 pt-1">
          <button
            type="button"
            onClick={() => onChangeField("isOshaRecordable", true)}
            className="flex items-center gap-2 text-[13px] font-bold text-[#0f172a]"
          >
            <div
              className={[
                "flex size-4.5 items-center justify-center rounded-full border transition-all",
                data.isOshaRecordable
                  ? "border-[#008ba3] bg-[#008ba3]"
                  : "border-[#cbd5e1] bg-white",
              ].join(" ")}
            >
              {data.isOshaRecordable ? (
                <div className="size-2 rounded-full bg-white" />
              ) : null}
            </div>
            <span>Yes</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeField("isOshaRecordable", false)}
            className="flex items-center gap-2 text-[13px] font-bold text-[#0f172a]"
          >
            <div
              className={[
                "flex size-4.5 items-center justify-center rounded-full border transition-all",
                !data.isOshaRecordable
                  ? "border-[#008ba3] bg-[#008ba3]"
                  : "border-[#cbd5e1] bg-white",
              ].join(" ")}
            >
              {!data.isOshaRecordable ? (
                <div className="size-2 rounded-full bg-white" />
              ) : null}
            </div>
            <span>No</span>
          </button>
        </div>
      </div>
    </div>
  );
}
