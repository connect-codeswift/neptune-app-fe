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

  const handleDaysAwayChange = (delta: number) => {
    onChangeField(
      "daysAwayFromWork",
      Math.max(0, data.daysAwayFromWork + delta),
    );
  };

  const handleDaysRestrictedChange = (delta: number) => {
    onChangeField(
      "daysOnRestrictedDuty",
      Math.max(0, data.daysOnRestrictedDuty + delta),
    );
  };

  return (
    <div className="flex flex-col gap-[18px]">
      <Text
        as="h2"
        className="text-[15px] leading-tight font-bold text-[#0b1320]"
      >
        Closure Classification
      </Text>

      <div className="flex flex-col gap-6">
        {/* Row 1: Final Incident Type + SIF Classification */}
        <div className="flex flex-col gap-6 sm:flex-row">
          {/* Final Incident Type */}
          <div className="flex flex-1 flex-col gap-[6px]">
            <label className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#8892a3]">
              Final Incident Type
            </label>
            <div className="relative flex items-center justify-between rounded-[8px] border border-[rgba(15,23,42,0.08)] bg-white px-3 py-[9px]">
              <select
                value={data.finalIncidentType}
                onChange={(e) =>
                  onChangeField("finalIncidentType", e.target.value)
                }
                className="w-full appearance-none bg-transparent pr-6 text-[13px] font-normal text-[#0b1320] outline-none"
              >
                {INCIDENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <Icon
                icon="mdi:chevron-down"
                className="pointer-events-none absolute right-3 text-[14px] text-[#64748b]"
              />
            </div>
            <span className="text-[11px] font-normal text-[#8892a3]">
              Defaults from intake - verify before closing
            </span>
          </div>

          {/* SIF Classification */}
          <div className="flex flex-1 flex-col gap-[6px]">
            <label className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#8892a3]">
              SIF Classification
            </label>
            <div className="relative flex items-center justify-between rounded-[8px] border border-[rgba(15,23,42,0.08)] bg-white px-3 py-[9px]">
              <select
                value={data.sifClassification}
                onChange={(e) =>
                  onChangeField("sifClassification", e.target.value)
                }
                className="w-full appearance-none bg-transparent pr-6 text-[13px] font-normal text-[#0b1320] outline-none"
              >
                {SIF_CLASSIFICATIONS.map((sif) => (
                  <option key={sif} value={sif}>
                    {sif}
                  </option>
                ))}
              </select>
              <Icon
                icon="mdi:chevron-down"
                className="pointer-events-none absolute right-3 text-[14px] text-[#64748b]"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Days Away + Days Restricted */}
        <div className="flex flex-col gap-6 sm:flex-row">
          {/* Days Away From Work */}
          <div className="flex flex-1 flex-col gap-[6px]">
            <label className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#8892a3]">
              Days Away from Work
            </label>
            <div className="flex items-center justify-between rounded-[8px] border border-[rgba(15,23,42,0.08)] bg-white px-3 py-[9px]">
              <input
                type="number"
                min={0}
                value={data.daysAwayFromWork}
                onChange={(e) =>
                  onChangeField(
                    "daysAwayFromWork",
                    Math.max(0, parseInt(e.target.value || "0", 10)),
                  )
                }
                className="w-full appearance-none bg-transparent text-[13px] font-semibold text-[#0b1320] outline-none [appearance:textfield]"
              />
              <div className="flex flex-col gap-[2px]">
                <button
                  type="button"
                  onClick={() => handleDaysAwayChange(1)}
                  className="leading-none text-[#64748b] hover:text-[#0b1320]"
                  aria-label="Increase days away"
                >
                  <Icon icon="mdi:chevron-up" className="size-[10px]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDaysAwayChange(-1)}
                  className="leading-none text-[#64748b] hover:text-[#0b1320]"
                  aria-label="Decrease days away"
                >
                  <Icon icon="mdi:chevron-down" className="size-[10px]" />
                </button>
              </div>
            </div>
          </div>

          {/* Days On Restricted Duty */}
          <div className="flex flex-1 flex-col gap-[6px]">
            <label className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#8892a3]">
              Days on Restricted Duty
            </label>
            <div className="flex items-center justify-between rounded-[8px] border border-[rgba(15,23,42,0.08)] bg-white px-3 py-[9px]">
              <input
                type="number"
                min={0}
                value={data.daysOnRestrictedDuty}
                onChange={(e) =>
                  onChangeField(
                    "daysOnRestrictedDuty",
                    Math.max(0, parseInt(e.target.value || "0", 10)),
                  )
                }
                className="w-full appearance-none bg-transparent text-[13px] font-semibold text-[#0b1320] outline-none [appearance:textfield]"
              />
              <div className="flex flex-col gap-[2px]">
                <button
                  type="button"
                  onClick={() => handleDaysRestrictedChange(1)}
                  className="leading-none text-[#64748b] hover:text-[#0b1320]"
                  aria-label="Increase restricted days"
                >
                  <Icon icon="mdi:chevron-up" className="size-[10px]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDaysRestrictedChange(-1)}
                  className="leading-none text-[#64748b] hover:text-[#0b1320]"
                  aria-label="Decrease restricted days"
                >
                  <Icon icon="mdi:chevron-down" className="size-[10px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recordable Under OSHA */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#8892a3]">
          Recordable under OSHA
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onChangeField("isOshaRecordable", true)}
            className="flex items-center gap-2 text-[13px] font-normal text-[#0b1320]"
          >
            <div
              className={[
                "flex size-4 items-center justify-center rounded-full border transition-all",
                data.isOshaRecordable
                  ? "border-[#0891a6] bg-[#0891a6]"
                  : "border-[rgba(15,23,42,0.08)] bg-white",
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
            className="flex items-center gap-2 text-[13px] font-normal text-[#0b1320]"
          >
            <div
              className={[
                "flex size-4 items-center justify-center rounded-full border transition-all",
                !data.isOshaRecordable
                  ? "border-[#0891a6] bg-[#0891a6]"
                  : "border-[rgba(15,23,42,0.08)] bg-white",
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
