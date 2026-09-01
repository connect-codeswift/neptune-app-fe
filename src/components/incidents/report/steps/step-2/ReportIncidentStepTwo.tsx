"use client";

import { Icon } from "@iconify/react";
import { useRef, useState } from "react";
import { AiTextAssistant } from "@/components/ai/AiTextAssistant";
import { useIncidentFieldDraft } from "@/components/incidents/report/shared/use-incident-draft";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  CASE_DISPOSITION_OPTIONS,
  CASE_CLOSED_NO_FURTHER_VALUE,
  FIT_FOR_DUTY_OPTIONS,
  INITIAL_TREATMENT_OPTIONS,
  MECHANISM_OPTIONS,
  NATURE_OF_INJURY_OPTIONS,
  TREATMENT_LOCATION_OPTIONS,
  TREATMENT_PROVIDER_OPTIONS,
  WHAT_TREATMENT_GIVEN_OPTIONS,
  YES_NO_OPTIONS,
  markAiAssisted,
  type CustomOptionField,
  type ReportIncidentFormState,
} from "@/forms/incident-module/index";
import {
  ReportSelectField,
  ReportTextareaField,
  ReportTextField,
} from "@/components/incidents/report/shared/ReportFormField";
import { ReportSelectWithAdd } from "@/components/incidents/report/shared/ReportSelectWithAdd";
import { ReportPhotosField } from "@/components/incidents/report/steps/step-2/ReportPhotosField";
import { MultipleUsersPickerInput } from "@/components/inputs/MultipleUsersPickerInput";
import { useCurrentSite } from "@/hooks/use-current-site";

export type ReportStepTwoErrors = Readonly<{
  mechanismOfInjury: string | null;
  natureOfInjury: string | null;
}>;

function getStepTwoErrors(form: ReportIncidentFormState): ReportStepTwoErrors {
  return {
    mechanismOfInjury: form.mechanismOfInjury.trim()
      ? null
      : "Select a mechanism of injury.",
    natureOfInjury: form.natureOfInjury.trim()
      ? null
      : "Select a nature of injury.",
  };
}

function hasStepTwoErrors(errors: ReportStepTwoErrors): boolean {
  return Boolean(errors.mechanismOfInjury || errors.natureOfInjury);
}

/**
 * The same rules the Continue button applies, in the shape the stepper needs.
 *
 * <p>Exported so a forward jump from the left-hand stepper cannot walk past answers
 * that Continue would have stopped on. The two paths out of this step disagreeing is
 * what made the step skippable.</p>
 */
export function validateStepTwo(form: ReportIncidentFormState): string | null {
  const errors = getStepTwoErrors(form);
  return errors.mechanismOfInjury ?? errors.natureOfInjury;
}

export type ReportIncidentStepTwoProps = Readonly<{
  form: ReportIncidentFormState;
  onChange: (next: Partial<ReportIncidentFormState>) => void;
  onBack?: () => void;
  onContinue?: () => void;
  showFieldErrors?: boolean;
  className?: string;
}>;

export function ReportIncidentStepTwo(
  props: Readonly<ReportIncidentStepTwoProps>,
) {
  const {
    form,
    onChange,
    onBack,
    onContinue,
    showFieldErrors = false,
    className = "",
  } = props;
  const [attemptedContinue, setAttemptedContinue] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const showErrors = attemptedContinue || showFieldErrors;
  const fieldErrors = showErrors ? getStepTwoErrors(form) : null;
  const site = useCurrentSite();
  const photos = form.photos ?? [];
  const isFirstAid = form.severity === "first-aid";
  const isCaseClosedNoFurther =
    form.caseDisposition === CASE_CLOSED_NO_FURTHER_VALUE;
  const draft = useIncidentFieldDraft(form, onChange, "description");

  /** Appends a reporter-typed option to one of the extendable dropdowns. */
  const addCustomOption = (field: CustomOptionField, option: string) => {
    onChange({
      customOptions: {
        ...form.customOptions,
        [field]: [...form.customOptions[field], option],
      },
    });
  };

  const handleContinue = () => {
    const errors = getStepTwoErrors(form);
    if (hasStepTwoErrors(errors)) {
      setAttemptedContinue(true);
      requestAnimationFrame(() => {
        formRef.current
          ?.querySelector("[data-field-error='true']")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    onContinue?.();
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-7.25"
      className={["min-w-0 flex-1", className].filter(Boolean).join(" ")}
    >
      <div ref={formRef} className="flex flex-col gap-7">
        <div className="flex flex-col">
          <div className="flex flex-col gap-1.5">
            <Text
              as="p"
              className="text-ehs-dark-blue text-xs font-bold tracking-wide uppercase"
            >
              Step 2
            </Text>
            <Text
              as="h2"
              className="text-ehs-dark-bg text-2xl font-semibold tracking-[-0.2px]"
            >
              Incident details
            </Text>
            <Text as="p" className="text-ehs-gray text-sm">
              Describe what happened and capture treatment, mechanism, and
              nature of injury.
            </Text>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-0 pt-4.5 sm:grid-cols-2">
            {!isFirstAid ? (
              <div className="pb-4.5">
                <ReportSelectWithAdd
                  label="Initial Treatment"
                  value={form.initialTreatment}
                  onChange={(initialTreatment) =>
                    onChange({ initialTreatment })
                  }
                  options={[...INITIAL_TREATMENT_OPTIONS]}
                  customOptions={form.customOptions.initialTreatment}
                  onAddCustomOption={(option) =>
                    addCustomOption("initialTreatment", option)
                  }
                  addLabel="Add more treatments"
                  addPlaceholder="e.g. Physiotherapy referral"
                />
              </div>
            ) : null}
            <div
              className={["pb-4.5", isFirstAid ? "sm:col-span-2" : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <ReportSelectField
                label="Was Secondary Treatment Sought"
                value={form.secondaryTreatment}
                onChange={(answer) =>
                  onChange({
                    secondaryTreatment: answer as "Yes" | "No",
                  })
                }
                options={[...YES_NO_OPTIONS]}
              />
            </div>
            <div className="pb-4.5">
              <ReportSelectWithAdd
                label="Mechanism of Injury"
                required
                value={form.mechanismOfInjury}
                onChange={(mechanismOfInjury) =>
                  onChange({ mechanismOfInjury })
                }
                options={[...MECHANISM_OPTIONS]}
                customOptions={form.customOptions.mechanismOfInjury}
                onAddCustomOption={(option) =>
                  addCustomOption("mechanismOfInjury", option)
                }
                addLabel="Add more injuries"
                addPlaceholder="e.g. Crushed between rollers"
                error={fieldErrors?.mechanismOfInjury ?? null}
              />
            </div>
            <div className="pb-4.5">
              <ReportSelectWithAdd
                label="Nature of Injury"
                required
                value={form.natureOfInjury}
                onChange={(natureOfInjury) => onChange({ natureOfInjury })}
                options={[...NATURE_OF_INJURY_OPTIONS]}
                customOptions={form.customOptions.natureOfInjury}
                onAddCustomOption={(option) =>
                  addCustomOption("natureOfInjury", option)
                }
                addLabel="Add custom injuries"
                addPlaceholder="e.g. Chemical inhalation"
                error={fieldErrors?.natureOfInjury ?? null}
              />
            </div>
          </div>

          {isFirstAid ? (
            <div className="grid grid-cols-1 gap-x-4 gap-y-0 pt-4.5 sm:grid-cols-2">
              <div className="pb-4.5">
                <ReportSelectField
                  label="What treatment was given?"
                  value={form.whatTreatmentWasGiven}
                  onChange={(answer) =>
                    onChange({ whatTreatmentWasGiven: answer })
                  }
                  options={[...WHAT_TREATMENT_GIVEN_OPTIONS]}
                />
              </div>
              <div className="pb-4.5">
                <ReportSelectField
                  label="Treatment provided by?"
                  value={form.treatmentProvidedBy}
                  onChange={(answer) =>
                    onChange({ treatmentProvidedBy: answer })
                  }
                  options={[...TREATMENT_PROVIDER_OPTIONS]}
                />
              </div>
              <div className="pb-4.5">
                <ReportSelectField
                  label="Treatment location?"
                  value={form.treatmentLocation}
                  onChange={(answer) => onChange({ treatmentLocation: answer })}
                  options={[...TREATMENT_LOCATION_OPTIONS]}
                />
              </div>
              <div className="pb-4.5">
                <ReportSelectField
                  label="Is employee able to return to full duty?"
                  value={form.isFitForFullDuty}
                  onChange={(answer) => onChange({ isFitForFullDuty: answer })}
                  options={[...FIT_FOR_DUTY_OPTIONS]}
                />
              </div>
              <div
                className={[
                  "pb-4.5",
                  isCaseClosedNoFurther ? "sm:col-span-2" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <ReportSelectField
                  label="Case disposition?"
                  value={form.caseDisposition}
                  onChange={(answer) =>
                    onChange({
                      caseDisposition: answer,
                      ...(answer === CASE_CLOSED_NO_FURTHER_VALUE
                        ? { furtherMedicalRecommended: "No" as const }
                        : {}),
                    })
                  }
                  options={[...CASE_DISPOSITION_OPTIONS]}
                />
              </div>
              {!isCaseClosedNoFurther ? (
                <div className="pb-4.5">
                  <ReportSelectField
                    label="Was further medical attention recommended"
                    value={form.furtherMedicalRecommended}
                    onChange={(answer) =>
                      onChange({
                        furtherMedicalRecommended: answer as "Yes" | "No",
                      })
                    }
                    options={[...YES_NO_OPTIONS]}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-x-4 py-4.5 sm:grid-cols-2">
            <div className={isFirstAid ? "sm:col-span-2" : ""}>
              <ReportTextField
                label="Object Involved"
                trailingHint="ⓘ What caused the injury"
                value={form.objectInvolved}
                onChange={(event) =>
                  onChange({ objectInvolved: event.target.value })
                }
                placeholder="Object or equipment involved"
              />
            </div>
            {!isFirstAid ? (
              <ReportSelectField
                label="OSHA Notification Required?"
                value={form.oshaNotificationRequired}
                onChange={(answer) =>
                  onChange({
                    oshaNotificationRequired: answer as "Yes" | "No",
                  })
                }
                options={[...YES_NO_OPTIONS]}
              />
            ) : null}
          </div>

          {/* Last of the written fields on purpose: everything above it is a
              structured answer, and those answers are what the draft below is
              built from. Asking for the narrative first meant writing it out
              and then re-picking the same facts from dropdowns. */}
          <ReportTextareaField
            // Taller than the default so a typical drafted narrative fits
            // without being clipped by the control strip along the bottom.
            className="pt-4.5 [&_textarea]:min-h-41"
            label="Describe incident in detail"
            trailingHint="Events before, during & after."
            value={form.description}
            onChange={(event) => {
              onChange({ description: event.target.value });
            }}
            placeholder="Describe what happened…"
            assistant={
              <AiTextAssistant
                module="incident"
                value={form.description}
                draftPending={draft.pending}
                onRegenerateDraft={draft.run}
                onApply={(description) => {
                  onChange({ description });
                }}
                onAssisted={() => {
                  onChange({
                    aiAssistedFields: markAiAssisted(
                      form.aiAssistedFields,
                      "description",
                    ),
                  });
                }}
              />
            }
          />

          <ReportPhotosField
            photos={photos}
            onChange={(nextPhotos) => onChange({ photos: nextPhotos })}
          />

          <MultipleUsersPickerInput
            className="pt-4.5"
            label="Witnesses"
            trailingHint="Search people."
            placeholder="Search people…"
            value={[...form.witnesses]}
            onChange={(witnesses) => {
              onChange({
                witnesses: witnesses.map((entry) => ({
                  userId: entry.userId,
                  name: entry.name,
                })),
              });
            }}
            siteId={site.id}
            siteName={site.name}
            // Nobody witnesses their own incident — the affected person is
            // dropped from the roster and refused as a typed name.
            excludeUserIds={
              form.affectedPersonId ? [form.affectedPersonId] : undefined
            }
            excludeNames={
              form.affectedPerson ? [form.affectedPerson] : undefined
            }
          />

          {isFirstAid ? (
            <ReportSelectField
              className="pt-4.5"
              label="Emergency Service Called?"
              value={form.classifications.emergency ?? ""}
              onChange={(answer) =>
                onChange({
                  classifications: {
                    ...form.classifications,
                    emergency: answer as "Yes" | "No",
                  },
                })
              }
              options={[...YES_NO_OPTIONS]}
            />
          ) : null}
        </div>

        <div className="border-ehs-border-ink/8 border-t pt-5.25">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="tertiary"
              onClick={onBack}
              className="text-ehs-slate rounded-2.5 border-ehs-border-ink/14 px-3.75 py-2.5 text-sm font-bold"
            >
              <Icon
                icon="mdi:chevron-left"
                className="size-3.25"
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
              className="rounded-2.5 px-3.75 py-2.5 text-sm font-bold shadow-(--ehs-shadow-button-primary-flat)"
            >
              Continue
              <Icon
                icon="mdi:chevron-right"
                className="size-3.25"
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
