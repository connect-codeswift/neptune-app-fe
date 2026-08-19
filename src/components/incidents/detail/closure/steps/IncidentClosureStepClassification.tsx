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
  "w-full rounded-2 border border-ehs-border-ink/8 bg-ehs-surface/55 px-3 py-2.25 text4 font-normal outline-none backdrop-blur-1.25";

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
    selectedIncidentType === "Restricted Work" && data.daysOnRestrictedDuty < 1;

  const medicalOnlyWithDaysAway =
    (selectedIncidentType === "Medical Only" ||
      selectedIncidentType === "First Aid") &&
    (data.daysAwayFromWork > 0 || data.daysOnRestrictedDuty > 0);

  const overrideReasonMissing =
    isOverridden && !data.oshaOverrideReason?.trim();

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
    <div className="flex flex-col gap-4.5">
      <Text as="h2" className="text5 text-ehs-dark-bg leading-normal font-bold">
        Closure Classification
      </Text>

      {/* Fatality Regulatory Warning Banner */}
      {isFatality && (
        <div className="rounded-2.5 border-ehs-red/30 bg-ehs-red/10 text-ehs-red flex items-start gap-3 border p-3">
          <Icon
            icon="mdi:alert-circle"
            className="text-ehs-red mt-0.5 size-5 shrink-0"
          />
          <div className="text4 flex flex-col leading-relaxed font-normal">
            <span className="text-ehs-red font-bold">
              Regulatory Action Required (OSHA 8-Hour Reporting)
            </span>
            <span>
              Fatality incidents trigger mandatory OSHA 8-hour regulatory
              reporting. Closure is locked behind senior management sign-off and
              verification of official agency notifications.
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Row 1: Final Incident Type + SIF Classification */}
        <div className="flex flex-col gap-6 sm:flex-row">
          {/* Final Incident Type */}
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text8 text-ehs-muted-text font-bold tracking-[0.5px] uppercase">
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
            <span className="text8 text-ehs-muted-text font-normal">
              Defaults from intake — verify before closing
            </span>
          </div>

          {/* SIF Classification */}
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text8 text-ehs-muted-text font-bold tracking-[0.5px] uppercase">
              SIF Classification
            </label>
            <GlassSelect
              options={SIF_CLASSIFICATION_OPTIONS}
              value={selectedSifClassification}
              onChange={(value) => onChangeField("sifClassification", value)}
              aria-label="SIF Classification"
              triggerClassName={CLASSIFICATION_TRIGGER_CLASS}
            />
            <span className="text8 text-ehs-muted-text font-normal">
              Independent of incident type — assess separately
            </span>
          </div>
        </div>

        {/* Row 2: Days Away + Days Restricted (conditionally shown) */}
        {(showDaysAway || showDaysRestricted) && (
          <div className="flex flex-col gap-6 sm:flex-row">
            {/* Days Away From Work */}
            {showDaysAway && (
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text8 text-ehs-muted-text font-bold tracking-[0.5px] uppercase">
                  Days Away from Work
                </label>
                <div
                  className={[
                    "rounded-2 backdrop-blur-1.25 bg-ehs-surface/55 flex items-center justify-between border px-3 py-2.25",
                    lostTimeMissingDays
                      ? "border-ehs-red"
                      : "border-ehs-border-ink/8",
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
                    className="text4 text-ehs-dark-bg w-full [appearance:textfield] bg-transparent font-semibold outline-none"
                  />
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleDaysAwayChange(1)}
                      className="text-ehs-gray hover:text-ehs-dark-bg leading-none"
                      aria-label="Increase days away"
                    >
                      <Icon icon="mdi:chevron-up" className="size-2.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDaysAwayChange(-1)}
                      className="text-ehs-gray hover:text-ehs-dark-bg leading-none"
                      aria-label="Decrease days away"
                    >
                      <Icon icon="mdi:chevron-down" className="size-2.5" />
                    </button>
                  </div>
                </div>
                {lostTimeMissingDays && (
                  <span className="text8 text-ehs-red font-normal">
                    Lost Time requires at least 1 day away.
                  </span>
                )}
              </div>
            )}

            {/* Days On Restricted Duty */}
            {showDaysRestricted && (
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text8 text-ehs-muted-text font-bold tracking-[0.5px] uppercase">
                  Days on Restricted Duty
                </label>
                <div
                  className={[
                    "rounded-2 backdrop-blur-1.25 bg-ehs-surface/55 flex items-center justify-between border px-3 py-2.25",
                    restrictedMissingDays
                      ? "border-ehs-red"
                      : "border-ehs-border-ink/8",
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
                    className="text4 text-ehs-dark-bg w-full [appearance:textfield] bg-transparent font-semibold outline-none"
                  />
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleDaysRestrictedChange(1)}
                      className="text-ehs-gray hover:text-ehs-dark-bg leading-none"
                      aria-label="Increase restricted days"
                    >
                      <Icon icon="mdi:chevron-up" className="size-2.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDaysRestrictedChange(-1)}
                      className="text-ehs-gray hover:text-ehs-dark-bg leading-none"
                      aria-label="Decrease restricted days"
                    >
                      <Icon icon="mdi:chevron-down" className="size-2.5" />
                    </button>
                  </div>
                </div>
                {restrictedMissingDays && (
                  <span className="text8 text-ehs-red font-normal">
                    Restricted Work / Job Transfer requires at least 1 day on
                    restricted duty.
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {medicalOnlyWithDaysAway && (
          <span className="text8 text-ehs-yellow font-normal">
            Days away or restricted duty is unusual for{" "}
            {incidentTypeLabel(selectedIncidentType)} — please verify
            classification.
          </span>
        )}
      </div>

      {/* Recordable Under OSHA */}
      <div className="flex flex-col gap-2">
        <label className="text8 text-ehs-muted-text font-bold tracking-[0.5px] uppercase">
          Recordable under OSHA
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => handleRecordableChange(true)}
            className="text4 text-ehs-dark-bg flex items-center gap-2 font-normal"
          >
            <div
              className={[
                "flex size-4 items-center justify-center rounded-full border transition-all",
                data.isOshaRecordable
                  ? "border-ehs-normal-blue bg-ehs-normal-blue"
                  : "border-ehs-border-ink/8 bg-ehs-surface",
              ].join(" ")}
            >
              {data.isOshaRecordable ? (
                <div className="bg-ehs-surface size-2 rounded-full" />
              ) : null}
            </div>
            <span>Yes</span>
          </button>

          <button
            type="button"
            onClick={() => handleRecordableChange(false)}
            className="text4 text-ehs-dark-bg flex items-center gap-2 font-normal"
          >
            <div
              className={[
                "flex size-4 items-center justify-center rounded-full border transition-all",
                !data.isOshaRecordable
                  ? "border-ehs-normal-blue bg-ehs-normal-blue"
                  : "border-ehs-border-ink/8 bg-ehs-surface",
              ].join(" ")}
            >
              {!data.isOshaRecordable ? (
                <div className="bg-ehs-surface size-2 rounded-full" />
              ) : null}
            </div>
            <span>No</span>
          </button>
        </div>

        {!isOverridden ? (
          <span className="text8 text-ehs-muted-text font-normal">
            Auto-set from Final Incident Type
          </span>
        ) : (
          <div className="rounded-2.5 border-ehs-yellow/40 bg-ehs-yellow/10 mt-2 flex flex-col gap-1 border p-3">
            <label className="text8 text-ehs-yellow font-bold tracking-[0.5px] uppercase">
              Why does this differ from the standard classification? *
            </label>
            <input
              type="text"
              value={data.oshaOverrideReason ?? ""}
              onChange={(e) =>
                onChangeField("oshaOverrideReason", e.target.value)
              }
              placeholder="Enter required reason for OSHA recordability override..."
              className="rounded-1.5 border-ehs-yellow/30 text4 text-ehs-dark-bg backdrop-blur-1.25 focus:border-ehs-yellow bg-ehs-surface/55 w-full border px-3 py-1.5 font-normal outline-none"
            />
            {overrideReasonMissing && (
              <span className="text8 text-ehs-red font-normal">
                An override reason is required for audit trails when changing
                default OSHA recordability.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
