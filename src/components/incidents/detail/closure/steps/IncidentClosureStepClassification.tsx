"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { IncidentClosureData } from "@/components/incidents/detail/incident-detail-types";

export type IncidentClosureStepClassificationProps = Readonly<{
  data: IncidentClosureData;
  onChangeField: <K extends keyof IncidentClosureData>(
    field: K,
    value: IncidentClosureData[K],
  ) => void;
}>;

const INCIDENT_TYPES = [
  "Select option",
  "Near Miss",
  "First Aid Only",
  "Medical Treatment Only",
  "Restricted Work / Job Transfer",
  "Lost Time",
  "Fatality",
];

const SIF_CLASSIFICATIONS = [
  "Not SIF",
  "Potential SIF (P-SIF)",
  "Actual SIF",
];

function getDerivedRecordable(finalIncidentType: string): boolean {
  switch (finalIncidentType) {
    case "Near Miss":
    case "First Aid Only":
      return false;
    case "Medical Treatment Only":
    case "Restricted Work / Job Transfer":
    case "Lost Time":
    case "Fatality":
      return true;
    default:
      return false;
  }
}

function showDaysAwayField(finalIncidentType: string): boolean {
  return finalIncidentType === "Lost Time";
}

function showDaysRestrictedField(finalIncidentType: string): boolean {
  return finalIncidentType === "Restricted Work / Job Transfer";
}

export function IncidentClosureStepClassification(
  props: Readonly<IncidentClosureStepClassificationProps>,
) {
  const { data, onChangeField } = props;

  const selectedIncidentType = data.finalIncidentType || "Select option";
  const selectedSifClassification =
    !data.sifClassification || data.sifClassification === "Select option"
      ? "Not SIF"
      : data.sifClassification;

  const derivedRecordable = getDerivedRecordable(selectedIncidentType);
  const isOverridden = data.isOshaRecordable !== derivedRecordable;
  const showDaysAway = showDaysAwayField(selectedIncidentType);
  const showDaysRestricted = showDaysRestrictedField(selectedIncidentType);
  const isFatality = selectedIncidentType === "Fatality";

  // --- Validation rules ---

  const lostTimeMissingDays =
    selectedIncidentType === "Lost Time" && data.daysAwayFromWork < 1;

  const restrictedMissingDays =
    selectedIncidentType === "Restricted Work / Job Transfer" &&
    data.daysOnRestrictedDuty < 1;

  const medicalOnlyWithDaysAway =
    (selectedIncidentType === "Medical Treatment Only" ||
      selectedIncidentType === "First Aid Only") &&
    (data.daysAwayFromWork > 0 || data.daysOnRestrictedDuty > 0);

  const overrideReasonMissing = isOverridden && !data.oshaOverrideReason?.trim();

  // --- Handlers ---

  const handleIncidentTypeChange = (value: string) => {
    onChangeField("finalIncidentType", value);

    const nextDerived = getDerivedRecordable(value);
    onChangeField("isOshaRecordable", nextDerived);

    if (!showDaysAwayField(value)) {
      onChangeField("daysAwayFromWork", 0);
    }
    if (!showDaysRestrictedField(value)) {
      onChangeField("daysOnRestrictedDuty", 0);
    }
  };

  const handleRecordableChange = (value: boolean) => {
    onChangeField("isOshaRecordable", value);
    if (value === getDerivedRecordable(selectedIncidentType)) {
      onChangeField("oshaOverrideReason", "");
    }
  };

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

      {/* Fatality Regulatory Warning Banner */}
      {isFatality && (
        <div className="flex items-start gap-3 rounded-[10px] border border-[#dc2626]/30 bg-[#fef2f2] p-3 text-[#991b1b]">
          <Icon icon="mdi:alert-circle" className="mt-0.5 size-5 shrink-0 text-[#dc2626]" />
          <div className="flex flex-col text-[12px] font-medium leading-relaxed">
            <span className="font-bold text-[#991b1b]">
              Regulatory Action Required (OSHA 8-Hour Reporting)
            </span>
            <span>
              Fatality incidents trigger mandatory OSHA 8-hour regulatory reporting. Closure is locked behind senior management sign-off and verification of official agency notifications.
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Row 1: Final Incident Type + SIF Classification */}
        <div className="flex flex-col gap-6 sm:flex-row">
          {/* Final Incident Type */}
          <div className="flex flex-1 flex-col gap-[6px]">
            <label className="text-[11px] font-bold tracking-[0.5px] text-[#8892a3] uppercase">
              Final Incident Type
            </label>
            <div className="relative flex items-center justify-between rounded-[8px] border border-[rgba(15,23,42,0.08)] bg-white px-3 py-[9px]">
              <select
                value={selectedIncidentType}
                onChange={(e) => handleIncidentTypeChange(e.target.value)}
                className={[
                  "w-full appearance-none bg-transparent pr-6 text-[13px] font-normal outline-none",
                  selectedIncidentType === "Select option"
                    ? "text-[#8892a3]"
                    : "text-[#0b1320]",
                ].join(" ")}
              >
                {INCIDENT_TYPES.map((type) => (
                  <option
                    key={type}
                    value={type}
                    className={
                      type === "Select option"
                        ? "text-[#8892a3]"
                        : "text-[#0b1320]"
                    }
                  >
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
              Defaults from intake — verify before closing
            </span>
          </div>

          {/* SIF Classification */}
          <div className="flex flex-1 flex-col gap-[6px]">
            <label className="text-[11px] font-bold tracking-[0.5px] text-[#8892a3] uppercase">
              SIF Classification
            </label>
            <div className="relative flex items-center justify-between rounded-[8px] border border-[rgba(15,23,42,0.08)] bg-white px-3 py-[9px]">
              <select
                value={selectedSifClassification}
                onChange={(e) =>
                  onChangeField("sifClassification", e.target.value)
                }
                className="w-full appearance-none bg-transparent pr-6 text-[13px] font-semibold text-[#0b1320] outline-none"
              >
                {SIF_CLASSIFICATIONS.map((sif) => (
                  <option key={sif} value={sif} className="text-[#0b1320]">
                    {sif}
                  </option>
                ))}
              </select>
              <Icon
                icon="mdi:chevron-down"
                className="pointer-events-none absolute right-3 text-[14px] text-[#64748b]"
              />
            </div>
            <span className="text-[11px] font-normal text-[#8892a3]">
              Independent of incident type — assess separately
            </span>
          </div>
        </div>

        {/* Row 2: Days Away + Days Restricted (conditionally shown) */}
        {(showDaysAway || showDaysRestricted) && (
          <div className="flex flex-col gap-6 sm:flex-row">
            {/* Days Away From Work */}
            {showDaysAway && (
              <div className="flex flex-1 flex-col gap-[6px]">
                <label className="text-[11px] font-bold tracking-[0.5px] text-[#8892a3] uppercase">
                  Days Away from Work
                </label>
                <div
                  className={[
                    "flex items-center justify-between rounded-[8px] border bg-white px-3 py-[9px]",
                    lostTimeMissingDays
                      ? "border-[#dc2626]"
                      : "border-[rgba(15,23,42,0.08)]",
                  ].join(" ")}
                >
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
                    className="w-full [appearance:textfield] appearance-none bg-transparent text-[13px] font-semibold text-[#0b1320] outline-none"
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
                {lostTimeMissingDays && (
                  <span className="text-[11px] font-normal text-[#dc2626]">
                    Lost Time requires at least 1 day away.
                  </span>
                )}
              </div>
            )}

            {/* Days On Restricted Duty */}
            {showDaysRestricted && (
              <div className="flex flex-1 flex-col gap-[6px]">
                <label className="text-[11px] font-bold tracking-[0.5px] text-[#8892a3] uppercase">
                  Days on Restricted Duty
                </label>
                <div
                  className={[
                    "flex items-center justify-between rounded-[8px] border bg-white px-3 py-[9px]",
                    restrictedMissingDays
                      ? "border-[#dc2626]"
                      : "border-[rgba(15,23,42,0.08)]",
                  ].join(" ")}
                >
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
                    className="w-full [appearance:textfield] appearance-none bg-transparent text-[13px] font-semibold text-[#0b1320] outline-none"
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
                {restrictedMissingDays && (
                  <span className="text-[11px] font-normal text-[#dc2626]">
                    Restricted Work / Job Transfer requires at least 1 day on restricted duty.
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {medicalOnlyWithDaysAway && (
          <span className="text-[11px] font-normal text-[#b45309]">
            Days away or restricted duty is unusual for {selectedIncidentType} — please verify classification.
          </span>
        )}
      </div>

      {/* Recordable Under OSHA */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold tracking-[0.5px] text-[#8892a3] uppercase">
          Recordable under OSHA
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => handleRecordableChange(true)}
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
            onClick={() => handleRecordableChange(false)}
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

        {!isOverridden ? (
          <span className="text-[11px] font-normal text-[#8892a3]">
            Auto-set from Final Incident Type
          </span>
        ) : (
          <div className="mt-2 flex flex-col gap-1 rounded-[10px] border border-[#f59e0b]/40 bg-[#fffbeb] p-3">
            <label className="text-[11px] font-bold tracking-[0.5px] text-[#b45309] uppercase">
              Why does this differ from the standard classification? *
            </label>
            <input
              type="text"
              value={data.oshaOverrideReason ?? ""}
              onChange={(e) => onChangeField("oshaOverrideReason", e.target.value)}
              placeholder="Enter required reason for OSHA recordability override..."
              className="w-full rounded-[6px] border border-[#fde68a] bg-white px-3 py-1.5 text-[12px] text-[#0b1320] outline-none focus:border-[#b45309]"
            />
            {overrideReasonMissing && (
              <span className="text-[11px] font-normal text-[#dc2626]">
                An override reason is required for audit trails when changing default OSHA recordability.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
