import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import {
  INCIDENT_TYPE_OPTIONS,
  SIF_CLASSIFICATION_OPTIONS,
  incidentTypeLabel,
} from "@/components/incidents/detail/closure/closure-classification-options";
import type { IncidentClosureData } from "@/components/incidents/detail/incident-detail-types";

export type IncidentClosureStepClassificationProps = Readonly<{
  data: IncidentClosureData;
  onChangeField: <K extends keyof IncidentClosureData>(
    field: K,
    value: IncidentClosureData[K],
  ) => void;
}>;

function getDerivedRecordable(finalIncidentType: string): boolean {
  switch (finalIncidentType) {
    case "Near Miss":
    case "First Aid":
      return false;
    case "Medical Only":
    case "Restricted Work":
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
  return finalIncidentType === "Restricted Work";
}

export function IncidentClosureStepClassification(
  props: Readonly<IncidentClosureStepClassificationProps>,
) {
  const { data, onChangeField } = props;

  const selectedIncidentType = data.finalIncidentType || "Select option";
  const selectedSifClassification =
    !data.sifClassification || data.sifClassification === "Select option"
      ? "Non-SIF"
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
    selectedIncidentType === "Restricted Work" &&
    data.daysOnRestrictedDuty < 1;

  const medicalOnlyWithDaysAway =
    (selectedIncidentType === "Medical Only" ||
      selectedIncidentType === "First Aid") &&
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
        className="text-[15px] leading-normal font-bold text-ehs-dark-bg"
      >
        Closure Classification
      </Text>

      {/* Fatality Regulatory Warning Banner */}
      {isFatality && (
        <div className="flex items-start gap-3 rounded-[10px] border border-ehs-red/30 bg-ehs-red/10 p-3 text-ehs-red">
          <Icon icon="mdi:alert-circle" className="mt-0.5 size-5 shrink-0 text-ehs-red" />
          <div className="flex flex-col text-[13px] font-normal leading-relaxed">
            <span className="font-bold text-ehs-red">
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
            <label className="text-[11px] font-bold tracking-[0.5px] text-ehs-muted-text uppercase">
              Final Incident Type
            </label>
            <div className="relative flex items-center justify-between rounded-[8px] border border-[rgba(15,23,42,0.08)] bg-white px-3 py-[9px]">
              <select
                value={selectedIncidentType}
                onChange={(e) => handleIncidentTypeChange(e.target.value)}
                className={[
                  "w-full appearance-none bg-transparent pr-6 text-[13px] font-normal outline-none",
                  selectedIncidentType === "Select option"
                    ? "text-ehs-muted-text"
                    : "text-ehs-dark-bg",
                ].join(" ")}
              >
                {INCIDENT_TYPE_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className={
                      option.value === "Select option"
                        ? "text-ehs-muted-text"
                        : "text-ehs-dark-bg"
                    }
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <Icon
                icon="mdi:chevron-down"
                className="pointer-events-none absolute right-3 text-sm text-ehs-gray"
              />
            </div>
            <span className="text-[11px] font-normal text-ehs-muted-text">
              Defaults from intake — verify before closing
            </span>
          </div>

          {/* SIF Classification */}
          <div className="flex flex-1 flex-col gap-[6px]">
            <label className="text-[11px] font-bold tracking-[0.5px] text-ehs-muted-text uppercase">
              SIF Classification
            </label>
            <div className="relative flex items-center justify-between rounded-[8px] border border-[rgba(15,23,42,0.08)] bg-white px-3 py-[9px]">
              <select
                value={selectedSifClassification}
                onChange={(e) =>
                  onChangeField("sifClassification", e.target.value)
                }
                className="w-full appearance-none bg-transparent pr-6 text-[13px] font-normal text-ehs-dark-bg outline-none"
              >
                {SIF_CLASSIFICATION_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="text-ehs-dark-bg"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <Icon
                icon="mdi:chevron-down"
                className="pointer-events-none absolute right-3 text-sm text-ehs-gray"
              />
            </div>
            <span className="text-[11px] font-normal text-ehs-muted-text">
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
                <label className="text-[11px] font-bold tracking-[0.5px] text-ehs-muted-text uppercase">
                  Days Away from Work
                </label>
                <div
                  className={[
                    "flex items-center justify-between rounded-[8px] border bg-white px-3 py-[9px]",
                    lostTimeMissingDays
                      ? "border-ehs-red"
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
                    className="w-full [appearance:textfield] appearance-none bg-transparent text-[13px] font-semibold text-ehs-dark-bg outline-none"
                  />
                  <div className="flex flex-col gap-[2px]">
                    <button
                      type="button"
                      onClick={() => handleDaysAwayChange(1)}
                      className="leading-none text-ehs-gray hover:text-ehs-dark-bg"
                      aria-label="Increase days away"
                    >
                      <Icon icon="mdi:chevron-up" className="size-[10px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDaysAwayChange(-1)}
                      className="leading-none text-ehs-gray hover:text-ehs-dark-bg"
                      aria-label="Decrease days away"
                    >
                      <Icon icon="mdi:chevron-down" className="size-[10px]" />
                    </button>
                  </div>
                </div>
                {lostTimeMissingDays && (
                  <span className="text-[11px] font-normal text-ehs-red">
                    Lost Time requires at least 1 day away.
                  </span>
                )}
              </div>
            )}

            {/* Days On Restricted Duty */}
            {showDaysRestricted && (
              <div className="flex flex-1 flex-col gap-[6px]">
                <label className="text-[11px] font-bold tracking-[0.5px] text-ehs-muted-text uppercase">
                  Days on Restricted Duty
                </label>
                <div
                  className={[
                    "flex items-center justify-between rounded-[8px] border bg-white px-3 py-[9px]",
                    restrictedMissingDays
                      ? "border-ehs-red"
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
                    className="w-full [appearance:textfield] appearance-none bg-transparent text-[13px] font-semibold text-ehs-dark-bg outline-none"
                  />
                  <div className="flex flex-col gap-[2px]">
                    <button
                      type="button"
                      onClick={() => handleDaysRestrictedChange(1)}
                      className="leading-none text-ehs-gray hover:text-ehs-dark-bg"
                      aria-label="Increase restricted days"
                    >
                      <Icon icon="mdi:chevron-up" className="size-[10px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDaysRestrictedChange(-1)}
                      className="leading-none text-ehs-gray hover:text-ehs-dark-bg"
                      aria-label="Decrease restricted days"
                    >
                      <Icon icon="mdi:chevron-down" className="size-[10px]" />
                    </button>
                  </div>
                </div>
                {restrictedMissingDays && (
                  <span className="text-[11px] font-normal text-ehs-red">
                    Restricted Work / Job Transfer requires at least 1 day on restricted duty.
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {medicalOnlyWithDaysAway && (
          <span className="text-[11px] font-normal text-ehs-yellow">
            Days away or restricted duty is unusual for {incidentTypeLabel(selectedIncidentType)} — please verify classification.
          </span>
        )}
      </div>

      {/* Recordable Under OSHA */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold tracking-[0.5px] text-ehs-muted-text uppercase">
          Recordable under OSHA
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => handleRecordableChange(true)}
            className="flex items-center gap-2 text-[13px] font-normal text-ehs-dark-bg"
          >
            <div
              className={[
                "flex size-4 items-center justify-center rounded-full border transition-all",
                data.isOshaRecordable
                  ? "border-ehs-normal-blue bg-ehs-normal-blue"
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
            className="flex items-center gap-2 text-[13px] font-normal text-ehs-dark-bg"
          >
            <div
              className={[
                "flex size-4 items-center justify-center rounded-full border transition-all",
                !data.isOshaRecordable
                  ? "border-ehs-normal-blue bg-ehs-normal-blue"
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
          <span className="text-[11px] font-normal text-ehs-muted-text">
            Auto-set from Final Incident Type
          </span>
        ) : (
          <div className="mt-2 flex flex-col gap-1 rounded-[10px] border border-ehs-yellow/40 bg-ehs-yellow/10 p-3">
            <label className="text-[11px] font-bold tracking-[0.5px] text-ehs-yellow uppercase">
              Why does this differ from the standard classification? *
            </label>
            <input
              type="text"
              value={data.oshaOverrideReason ?? ""}
              onChange={(e) => onChangeField("oshaOverrideReason", e.target.value)}
              placeholder="Enter required reason for OSHA recordability override..."
              className="w-full rounded-[6px] border border-ehs-yellow/30 bg-white px-3 py-1.5 text-[13px] font-normal text-ehs-dark-bg outline-none focus:border-ehs-yellow"
            />
            {overrideReasonMissing && (
              <span className="text-[11px] font-normal text-ehs-red">
                An override reason is required for audit trails when changing default OSHA recordability.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
