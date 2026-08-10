"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { AiInFieldDraft } from "@/components/ai/AiInFieldDraft";
import { AiTextAssistant } from "@/components/ai/AiTextAssistant";
import {
  NATURE_OF_INJURY_OPTIONS,
  YES_NO_OPTIONS,
  lightTreatmentForSeverityHint,
  markAiAssisted,
  toggleInitialTreatment,
  treatmentOptionsForSeverity,
  type CustomOptionField,
  type ReportIncidentFormState,
} from "@/components/incidents/report/shared/report-incident-data";
import {
  ReportFieldLabel,
  ReportSelectField,
  ReportTextareaField,
} from "@/components/incidents/report/shared/ReportFormField";
import { ReportSelectWithAdd } from "@/components/incidents/report/shared/ReportSelectWithAdd";
import { ReportDerivedClassificationBanner } from "@/components/incidents/report/shared/ReportDerivedClassificationBanner";
import { ReportBodyPartField } from "@/components/incidents/report/steps/step-3/ReportBodyPartField";
import { toast } from "@/lib/toast";

export type ReportIncidentStepThreeProps = Readonly<{
  form: ReportIncidentFormState;
  onChange: (next: Partial<ReportIncidentFormState>) => void;
  onBack?: () => void;
  onContinue?: () => void;
  className?: string;
}>;

function hasBodyPartSelected(form: ReportIncidentFormState): boolean {
  return (
    (form.bodyParts?.length ?? 0) > 0 ||
    (form.customBodyParts?.length ?? 0) > 0
  );
}

export function validateStepThree(form: ReportIncidentFormState): string | null {
  if (!form.natureOfInjury.trim()) {
    return "Select a nature of injury.";
  }

  const noInjury = form.natureOfInjury === "none";
  if (!noInjury && !hasBodyPartSelected(form)) {
    return "Select at least one body part affected.";
  }

  if (!noInjury && hasBodyPartSelected(form) && !form.injuryDescription.trim()) {
    return "Describe the injury.";
  }

  if (form.initialTreatment.length === 0) {
    return "Select at least one initial treatment option.";
  }

  if (!form.secondaryTreatment) {
    return 'Answer "Was Secondary Treatment Sought?".';
  }

  return null;
}

export function ReportIncidentStepThree(
  props: Readonly<ReportIncidentStepThreeProps>,
) {
  const { form, onChange, onBack, onContinue, className = "" } = props;

  const noInjury = form.natureOfInjury === "none";
  const treatmentOptions = treatmentOptionsForSeverity(form.severity);
  const treatmentHint = lightTreatmentForSeverityHint(
    form.severity,
    form.initialTreatment,
  );

  const injuryDraftPending =
    form.aiDraftPending && form.injuryDescription.trim() === "";
  const showsInjuryDraft =
    injuryDraftPending || form.aiDrafts.injuryDescription !== null;

  const addCustomOption = (field: CustomOptionField, option: string) => {
    onChange({
      customOptions: {
        ...form.customOptions,
        [field]: [...form.customOptions[field], option],
      },
    });
  };

  const toggleTreatment = (value: string) => {
    onChange({
      initialTreatment: toggleInitialTreatment(
        form.initialTreatment,
        value,
        form.severity,
      ),
    });
  };

  const handleContinue = () => {
    const validationError = validateStepThree(form);
    if (validationError) {
      toast.error("Missing required fields", validationError);
      return;
    }
    onContinue?.();
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-[29px]"
      className={["min-w-0 flex-1", className].filter(Boolean).join(" ")}
    >
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Text
              as="p"
              className="text-ehs-dark-blue text-xs font-bold tracking-wide uppercase"
            >
              Step 3
            </Text>
            <Text
              as="h2"
              className="text-ehs-dark-bg text-[21.8px] font-bold tracking-[-0.44px]"
            >
              Injury & treatment
            </Text>
            <Text as="p" className="text-ehs-gray text-sm">
              Nature, body part, and treatment given on site.
            </Text>
          </div>

          <ReportDerivedClassificationBanner
            severity={form.severity}
            sipAnswer={form.classifications.serious}
          />

          <div className="pb-[18px]">
            <ReportSelectWithAdd
              label="Nature of Injury"
              required
              value={form.natureOfInjury}
              onChange={(natureOfInjury) =>
                onChange({
                  natureOfInjury,
                  ...(natureOfInjury === "none"
                    ? {
                        bodyParts: [],
                        customBodyParts: [],
                        bodyPartSides: {},
                        injuryDescription: "",
                      }
                    : {}),
                })
              }
              options={[...NATURE_OF_INJURY_OPTIONS]}
              customOptions={form.customOptions.natureOfInjury}
              onAddCustomOption={(option) =>
                addCustomOption("natureOfInjury", option)
              }
              addLabel="Add custom injuries"
              addPlaceholder="e.g. Chemical inhalation"
            />
          </div>

          {!noInjury ? (
            <>
              <ReportBodyPartField
                bodyParts={form.bodyParts ?? []}
                bodyPartSides={form.bodyPartSides ?? {}}
                bodySide={form.bodySide ?? "Left"}
                multiSelect={form.bodyMultiSelect ?? false}
                onBodyPartsChange={(bodyParts) => onChange({ bodyParts })}
                onBodyPartSidesChange={(bodyPartSides) =>
                  onChange({ bodyPartSides })
                }
                onBodySideChange={(bodySide) => onChange({ bodySide })}
                onMultiSelectChange={(bodyMultiSelect) =>
                  onChange({ bodyMultiSelect })
                }
                customBodyParts={form.customBodyParts ?? []}
                onCustomBodyPartsChange={(customBodyParts) =>
                  onChange({ customBodyParts })
                }
              />

              <div className="pt-[18px]">
                <ReportTextareaField
                  className="[&_textarea]:min-h-[150px]"
                  label="Injury description"
                  required
                  value={form.injuryDescription}
                  onChange={(event) => {
                    const injuryDescription = event.target.value;
                    onChange({
                      injuryDescription,
                      ...(form.aiDrafts.injuryDescription
                        ? {
                            aiDrafts: {
                              ...form.aiDrafts,
                              injuryDescription: null,
                            },
                          }
                        : {}),
                    });
                  }}
                  placeholder={showsInjuryDraft ? "" : "Describe the injury…"}
                  rows={3}
                  assistant={
                    showsInjuryDraft ? (
                      <AiInFieldDraft
                        draft={form.aiDrafts.injuryDescription}
                        pending={injuryDraftPending}
                        onAccept={(text) =>
                          onChange({
                            injuryDescription: text,
                            aiAssistedFields: markAiAssisted(
                              form.aiAssistedFields,
                              "injuryDescription",
                            ),
                            aiDrafts: {
                              ...form.aiDrafts,
                              injuryDescription: null,
                            },
                          })
                        }
                        onDismiss={() =>
                          onChange({
                            aiDrafts: {
                              ...form.aiDrafts,
                              injuryDescription: null,
                            },
                          })
                        }
                      />
                    ) : (
                      <AiTextAssistant
                        module="incident"
                        value={form.injuryDescription}
                        onApply={(injuryDescription) => {
                          onChange({ injuryDescription });
                        }}
                        onAssisted={() => {
                          onChange({
                            aiAssistedFields: markAiAssisted(
                              form.aiAssistedFields,
                              "injuryDescription",
                            ),
                          });
                        }}
                      />
                    )
                  }
                />
              </div>
            </>
          ) : form.natureOfInjury === "none" ? (
            <div className="border-ehs-border bg-ehs-light-bg rounded-[12px] border p-3.5">
              <p className="text-ehs-gray text-sm leading-normal">
                Nature of injury is &ldquo;No injury&rdquo; — body part and injury
                description are not required.
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5 pt-[14px]">
            <ReportFieldLabel label="Initial Treatment" required />
            {form.severity === "first-aid" ? (
              <p className="text-ehs-muted-text text-xs leading-normal">
                First Aid severity only allows on-site first aid or none. Change
                severity on step 1 to unlock clinic/ER options.
              </p>
            ) : null}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {treatmentOptions.map((option) => {
                const isChecked = form.initialTreatment.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleTreatment(option.value)}
                    className={[
                      "flex min-h-[52px] cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-3 text-left transition-all duration-200",
                      isChecked
                        ? "border-ehs-normal-blue/40 bg-ehs-normal-blue/8 shadow-[0_0_0_1px_rgba(8,145,166,0.06)]"
                        : "border-[rgba(15,23,42,0.08)] bg-white/62 hover:border-[rgba(15,23,42,0.16)] hover:bg-white/80",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "flex size-5 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                        isChecked
                          ? "bg-ehs-normal-blue border-ehs-normal-blue text-ehs-light-text"
                          : "border-[rgba(15,23,42,0.18)] bg-white",
                      ].join(" ")}
                    >
                      {isChecked ? (
                        <Icon icon="mdi:check" className="size-3.5" />
                      ) : null}
                    </div>
                    <span
                      className={[
                        "text-sm leading-normal font-semibold",
                        isChecked ? "text-ehs-dark-blue" : "text-ehs-dark-bg",
                      ].join(" ")}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {treatmentHint ? (
              <p className="text-ehs-dark-blue text-xs leading-normal">
                {treatmentHint}
              </p>
            ) : null}
          </div>

          <div className="pb-[18px]">
            <ReportSelectField
              label="Was Secondary Treatment Sought?"
              required
              value={form.secondaryTreatment}
              onChange={(answer) =>
                onChange({
                  secondaryTreatment: answer as "Yes" | "No",
                })
              }
              options={[...YES_NO_OPTIONS]}
            />
          </div>
        </div>

        <div className="border-t border-[rgba(15,23,42,0.08)] pt-[21px]">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="tertiary"
              onClick={onBack}
              className="rounded-[10px] px-[15px] py-2.5 text-sm font-bold"
            >
              <Icon
                icon="mdi:chevron-left"
                className="size-[13px]"
                aria-hidden="true"
              />
              Back
            </Button>

            <p className="text-ehs-muted-text min-w-0 flex-1 text-xs">
              Required fields marked with{" "}
              <span className="text-ehs-red">*</span>
            </p>

            <Button
              type="button"
              variant="primary"
              onClick={handleContinue}
              className="rounded-[10px] px-[15px] py-2.5 text-sm font-bold shadow-[0px_6px_18px_-6px_var(--ehs-normal-blue)]"
            >
              Continue
              <Icon
                icon="mdi:chevron-right"
                className="size-[13px]"
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
