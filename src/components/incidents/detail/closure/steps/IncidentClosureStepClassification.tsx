import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import {
  INCIDENT_TYPE_OPTIONS,
  SIF_CLASSIFICATION_OPTIONS,
  incidentTypeLabel,
} from "@/components/incidents/detail/closure/closure-classification-options";
import type { IncidentClosureData } from "@/components/incidents/detail/incident-detail-types";
import { GlassSelect } from "@/components/ui/GlassSelect";

/**
 * The "Select option" sentinel row renders as GlassSelect's placeholder rather
 * than a pickable entry — value stays "Select option" until a real type is
 * chosen, exactly as before.
 */
const INCIDENT_TYPE_SELECT_OPTIONS = INCIDENT_TYPE_OPTIONS.filter(
  (option) => option.value !== "Select option",
);

/** Same frame the native selects' wrapper drew, now on GlassSelect's trigger. */
const CLASSIFICATION_TRIGGER_CLASS =
  "w-full rounded-[8px] border border-[rgba(15,23,42,0.08)] bg-white/55 px-3 py-[9px] text4 font-normal outline-none backdrop-blur-[5px]";

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
        className="text5 leading-normal font-bold text-ehs-dark-bg"
      >
        Closure Classification
      </Text>

      {/* Fatality Regulatory Warning Banner */}
      {isFatality && (
        <div className="flex items-start gap-3 rounded-[10px] border border-ehs-red/30 bg-ehs-red/10 p-3 text-ehs-red">
          <Icon icon="mdi:alert-circle" className="mt-0.5 size-5 shrink-0 text-ehs-red" />
          <div className="flex flex-col text4 font-normal leading-relaxed">
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
            <label className="text8 font-bold tracking-[0.5px] text-ehs-muted-text uppercase">
              Final Incident Type
            </label>
            <GlassSelect
              options={INCIDENT_TYPE_SELECT_OPTIONS}
              value={selectedIncidentType}
              onChange={handleIncidentTypeChange}
              placeholder="Select option"
              aria-label="Final Incident Type"
              triggerClassName={CLASSIFICATION_TRIGGER_CLASS}
            />
            <span className="text8 font-normal text-ehs-muted-text">
              Defaults from intake — verify before closing
            </span>
          </div>

          {/* SIF Classification */}
          <div className="flex flex-1 flex-col gap-[6px]">
            <label className="text8 font-bold tracking-[0.5px] text-ehs-muted-text uppercase">
              SIF Classification
            </label>
            <GlassSelect
              options={SIF_CLASSIFICATION_OPTIONS}
              value={selectedSifClassification}
              onChange={(value) => onChangeField("sifClassification", value)}
              aria-label="SIF Classification"
              triggerClassName={CLASSIFICATION_TRIGGER_CLASS}
            />
            <span className="text8 font-normal text-ehs-muted-text">
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
                <label className="text8 font-bold tracking-[0.5px] text-ehs-muted-text uppercase">
                  Days Away from Work
                </label>
                <div
                  className={[
                    "flex items-center justify-between rounded-[8px] border bg-white/55 px-3 py-[9px] backdrop-blur-[5px]",
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
                    className="w-full [appearance:textfield] appearance-none bg-transparent text4 font-semibold text-ehs-dark-bg outline-none"
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
                  <span className="text8 font-normal text-ehs-red">
                    Lost Time requires at least 1 day away.
                  </span>
                )}
              </div>
            )}

            {/* Days On Restricted Duty */}
            {showDaysRestricted && (
              <div className="flex flex-1 flex-col gap-[6px]">
                <label className="text8 font-bold tracking-[0.5px] text-ehs-muted-text uppercase">
                  Days on Restricted Duty
                </label>
                <div
                  className={[
                    "flex items-center justify-between rounded-[8px] border bg-white/55 px-3 py-[9px] backdrop-blur-[5px]",
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
                    className="w-full [appearance:textfield] appearance-none bg-transparent text4 font-semibold text-ehs-dark-bg outline-none"
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
                  <span className="text8 font-normal text-ehs-red">
                    Restricted Work / Job Transfer requires at least 1 day on restricted duty.
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {medicalOnlyWithDaysAway && (
          <span className="text8 font-normal text-ehs-yellow">
            Days away or restricted duty is unusual for {incidentTypeLabel(selectedIncidentType)} — please verify classification.
          </span>
        )}
      </div>

      {/* Recordable Under OSHA */}
      <div className="flex flex-col gap-2">
        <label className="text8 font-bold tracking-[0.5px] text-ehs-muted-text uppercase">
          Recordable under OSHA
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => handleRecordableChange(true)}
            className="flex items-center gap-2 text4 font-normal text-ehs-dark-bg"
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
            className="flex items-center gap-2 text4 font-normal text-ehs-dark-bg"
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
          <span className="text8 font-normal text-ehs-muted-text">
            Auto-set from Final Incident Type
          </span>
        ) : (
          <div className="mt-2 flex flex-col gap-1 rounded-[10px] border border-ehs-yellow/40 bg-ehs-yellow/10 p-3">
            <label className="text8 font-bold tracking-[0.5px] text-ehs-yellow uppercase">
              Why does this differ from the standard classification? *
            </label>
            <input
              type="text"
              value={data.oshaOverrideReason ?? ""}
              onChange={(e) => onChangeField("oshaOverrideReason", e.target.value)}
              placeholder="Enter required reason for OSHA recordability override..."
              className="w-full rounded-[6px] border border-ehs-yellow/30 bg-white/55 px-3 py-1.5 text4 font-normal text-ehs-dark-bg outline-none backdrop-blur-[5px] focus:border-ehs-yellow"
            />
            {overrideReasonMissing && (
              <span className="text8 font-normal text-ehs-red">
                An override reason is required for audit trails when changing default OSHA recordability.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
