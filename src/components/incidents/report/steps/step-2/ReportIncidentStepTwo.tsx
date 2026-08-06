"use client";

import { Icon } from "@iconify/react";
import { useEffect } from "react";
import { AiInFieldDraft } from "@/components/ai/AiInFieldDraft";
import { AiTextAssistant } from "@/components/ai/AiTextAssistant";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  CASE_DISPOSITION_OPTIONS,
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
} from "@/components/incidents/report/shared/report-incident-data";
import {
  ReportSelectField,
  ReportTextareaField,
  ReportTextField,
} from "@/components/incidents/report/shared/ReportFormField";
import { ReportSelectWithAdd } from "@/components/incidents/report/shared/ReportSelectWithAdd";
import { ReportPhotosField } from "@/components/incidents/report/steps/step-2/ReportPhotosField";
import { ReportWitnessesField } from "@/components/incidents/report/shared/ReportWitnessesField";
import {
  buildDescriptionFacts,
  canDraftDescription,
} from "@/components/incidents/report/shared/report-description-draft";
import { useDescriptionDraftMutation } from "@/hooks/use-ai-text-mutations";
import { useCurrentSite } from "@/hooks/use-current-site";
import { logAiAssistFailure } from "@/services/ai-text.service";
import { toast } from "@/lib/toast";

/** Long enough that filling several dropdowns in a row is one call, not five. */
const DRAFT_DEBOUNCE_MS = 900;

export type ReportIncidentStepTwoProps = Readonly<{
  form: ReportIncidentFormState;
  onChange: (next: Partial<ReportIncidentFormState>) => void;
  onBack?: () => void;
  onContinue?: () => void;
  className?: string;
}>;

function validateStepTwo(form: ReportIncidentFormState): string | null {
  if (!form.mechanismOfInjury.trim()) {
    return "Select a mechanism of injury.";
  }
  if (!form.natureOfInjury.trim()) {
    return "Select a nature of injury.";
  }
  return null;
}

export function ReportIncidentStepTwo(
  props: Readonly<ReportIncidentStepTwoProps>,
) {
  const { form, onChange, onBack, onContinue, className = "" } = props;
  const site = useCurrentSite();
  const photos = form.photos ?? [];
  const isFirstAid = form.severity === "first-aid";
  const descriptionDraftMutation = useDescriptionDraftMutation();
  // The draft owns the field's controls while it is being fetched or
  // offered; once resolved the proofread button takes the slot back.
  const showsDraft =
    form.descriptionDraft.pending || form.descriptionDraft.text !== null;

  const draftFacts = buildDescriptionFacts(form);
  const wantsDraft =
    canDraftDescription(form) &&
    form.description.trim() === "" &&
    !form.descriptionDraft.dismissed &&
    !form.descriptionDraft.pending &&
    draftFacts !== form.descriptionDraft.source;

  /**
   * Drafts the description once the answers above it are substantial enough to
   * be worth summarising.
   *
   * Debounced rather than fired per keystroke because those answers arrive one
   * dropdown at a time, and every intermediate state would otherwise cost a
   * model call. Re-runs only when the composed facts actually change, so
   * re-picking the same option is free.
   */
  useEffect(() => {
    if (!wantsDraft) {
      return;
    }

    const timer = globalThis.setTimeout(() => {
      onChange({
        descriptionDraft: {
          ...form.descriptionDraft,
          pending: true,
          source: draftFacts,
        },
      });

      descriptionDraftMutation
        .mutateAsync(draftFacts)
        .then((text) => {
          onChange({
            descriptionDraft: {
              text,
              isAi: true,
              pending: false,
              source: draftFacts,
              dismissed: false,
            },
          });
        })
        .catch((error: unknown) => {
          // The composed facts are still a usable draft, so offer them rather
          // than nothing — labelled as ours, not the model's. This is also the
          // path taken wherever `Ai__ApiKey` isn't configured, which is why the
          // feature must not depend on the call succeeding.
          logAiAssistFailure("description-draft", error);
          onChange({
            descriptionDraft: {
              text: draftFacts,
              isAi: false,
              pending: false,
              source: draftFacts,
              dismissed: false,
            },
          });
        });
    }, DRAFT_DEBOUNCE_MS);

    return () => {
      globalThis.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantsDraft, draftFacts]);

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
    const validationError = validateStepTwo(form);
    if (validationError) {
      toast.error("Missing required fields", validationError);
      return;
    }
    onContinue?.();
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-[29px]"
      className={["min-w-0 flex-1", className].filter(Boolean).join(" ")}
    >
      <div className="flex flex-col gap-7">
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

          <div className="grid grid-cols-1 gap-x-4 gap-y-0 pt-[18px] sm:grid-cols-2">
            <div className="pb-[18px]">
              <ReportSelectWithAdd
                label="Initial Treatment"
                required
                value={form.initialTreatment}
                onChange={(initialTreatment) => onChange({ initialTreatment })}
                options={[...INITIAL_TREATMENT_OPTIONS]}
                customOptions={form.customOptions.initialTreatment}
                onAddCustomOption={(option) =>
                  addCustomOption("initialTreatment", option)
                }
                addLabel="Add more treatments"
                addPlaceholder="e.g. Physiotherapy referral"
              />
            </div>
            <div className="pb-[18px]">
              <ReportSelectField
                label="Was Secondary Treatment Sought"
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
            <div className="pb-[18px]">
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
              />
            </div>
            <div className="pb-[18px]">
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
              />
            </div>
          </div>

          {isFirstAid ? (
            <div className="grid grid-cols-1 gap-x-4 gap-y-0 pt-[18px] sm:grid-cols-2">
              <div className="pb-[18px]">
                <ReportSelectField
                  label="What treatment was given?"
                  required
                  value={form.whatTreatmentWasGiven}
                  onChange={(answer) =>
                    onChange({ whatTreatmentWasGiven: answer })
                  }
                  options={[...WHAT_TREATMENT_GIVEN_OPTIONS]}
                />
              </div>
              <div className="pb-[18px]">
                <ReportSelectField
                  label="Treatment provided by?"
                  required
                  value={form.treatmentProvidedBy}
                  onChange={(answer) =>
                    onChange({ treatmentProvidedBy: answer })
                  }
                  options={[...TREATMENT_PROVIDER_OPTIONS]}
                />
              </div>
              <div className="pb-[18px]">
                <ReportSelectField
                  label="Treatment location?"
                  required
                  value={form.treatmentLocation}
                  onChange={(answer) => onChange({ treatmentLocation: answer })}
                  options={[...TREATMENT_LOCATION_OPTIONS]}
                />
              </div>
              <div className="pb-[18px]">
                <ReportSelectField
                  label="Is employee able to return to full duty?"
                  required
                  value={form.isFitForFullDuty}
                  onChange={(answer) => onChange({ isFitForFullDuty: answer })}
                  options={[...FIT_FOR_DUTY_OPTIONS]}
                />
              </div>
              <div className="pb-[18px]">
                <ReportSelectField
                  label="Case disposition?"
                  required
                  value={form.caseDisposition}
                  onChange={(answer) => onChange({ caseDisposition: answer })}
                  options={[...CASE_DISPOSITION_OPTIONS]}
                />
              </div>
              <div className="pb-[18px]">
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
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-x-4 py-[18px] sm:grid-cols-2">
            <ReportTextField
              label="Object Involved"
              required
              trailingHint="ⓘ What caused the injury"
              value={form.objectInvolved}
              onChange={(event) =>
                onChange({ objectInvolved: event.target.value })
              }
              placeholder="Object or equipment involved"
            />
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
          </div>

          {/* Last of the written fields on purpose: everything above it is a
              structured answer, and those answers are what the draft below is
              built from. Asking for the narrative first meant writing it out
              and then re-picking the same facts from dropdowns. */}
          <ReportTextareaField
            // Taller than the default so a typical drafted narrative fits
            // without being clipped by the control strip along the bottom.
            className="pt-[18px] [&_textarea]:min-h-[164px]"
            label="Describe incident in detail"
            required
            trailingHint="Events before, during & after."
            value={form.description}
            onChange={(event) => {
              const description = event.target.value;
              // Their own words take over: a draft still sitting underneath
              // while they type is an offer they have already answered.
              onChange({
                description,
                ...(form.descriptionDraft.text || form.descriptionDraft.pending
                  ? {
                      descriptionDraft: {
                        ...form.descriptionDraft,
                        text: null,
                        pending: false,
                        dismissed: true,
                      },
                    }
                  : {}),
              });
            }}
            // Suppressed while a draft occupies the field — the browser would
            // otherwise paint the placeholder underneath the ghost text.
            placeholder={showsDraft ? "" : "Describe what happened…"}
            assistant={
              showsDraft ? (
                <AiInFieldDraft
                  draft={form.descriptionDraft.text}
                  pending={form.descriptionDraft.pending}
                  // Only claims the model wrote it when the model actually did
                  // — the fallback is composed by `buildDescriptionFacts`.
                  label={
                    form.descriptionDraft.isAi
                      ? "AI draft"
                      : "Draft from your answers"
                  }
                  onAccept={(text) =>
                    onChange({
                      description: text,
                      // Provenance follows the same rule: a locally composed
                      // draft is not an AI-assisted field, and saying it was
                      // would put a false claim on an OSHA-relevant record.
                      ...(form.descriptionDraft.isAi
                        ? {
                            aiAssistedFields: markAiAssisted(
                              form.aiAssistedFields,
                              "description",
                            ),
                          }
                        : {}),
                      descriptionDraft: {
                        ...form.descriptionDraft,
                        text: null,
                        dismissed: true,
                      },
                    })
                  }
                  onDismiss={() =>
                    onChange({
                      descriptionDraft: {
                        ...form.descriptionDraft,
                        text: null,
                        dismissed: true,
                      },
                    })
                  }
                />
              ) : (
                // The proofread button needs text to work on, so it only takes
                // the slot back once the draft has been resolved either way.
                <AiTextAssistant
                  value={form.description}
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
              )
            }
          />

          <ReportPhotosField
            photos={photos}
            onChange={(nextPhotos) => onChange({ photos: nextPhotos })}
          />

          <ReportWitnessesField
            className="pt-[18px]"
            label="Witnesses"
            trailingHint="Search people at your site, or press Enter to add a name."
            value={form.witnesses}
            onChange={(witnesses) => onChange({ witnesses })}
            siteId={site.id}
            siteName={site.name}
          />

          {isFirstAid ? (
            <ReportSelectField
              className="pt-[18px]"
              label="Emergency Service Called?"
              value={form.classifications.emergency ?? "No"}
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

        <div className="border-t border-[rgba(15,23,42,0.08)] pt-[21px]">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="tertiary"
              onClick={onBack}
              className="text-ehs-slate rounded-[10px] border-[rgba(15,23,42,0.14)] px-[15px] py-2.5 text-sm font-bold"
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
