"use client";

import { Icon } from "@iconify/react";
import { useEffect } from "react";
import { AiInFieldDraft } from "@/components/ai/AiInFieldDraft";
import { AiTextAssistant } from "@/components/ai/AiTextAssistant";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  MECHANISM_OPTIONS,
  markAiAssisted,
  type CustomOptionField,
  type ReportIncidentFormState,
} from "@/components/incidents/report/shared/report-incident-data";
import {
  ReportTextareaField,
  ReportTextField,
} from "@/components/incidents/report/shared/ReportFormField";
import { ReportSelectWithAdd } from "@/components/incidents/report/shared/ReportSelectWithAdd";
import { ReportPhotosField } from "@/components/incidents/report/steps/step-2/ReportPhotosField";
import { ReportWitnessesField } from "@/components/incidents/report/shared/ReportWitnessesField";
import {
  buildDraftAssistInput,
  canDraftDescription,
  draftInputKey,
} from "@/components/incidents/report/shared/report-ai-draft";
import { useDraftAssistMutation } from "@/hooks/use-ai-text-mutations";
import { useCurrentSite } from "@/hooks/use-current-site";
import { logAiAssistFailure } from "@/services/ai-text.service";
import { toast } from "@/lib/toast";

const DRAFT_DEBOUNCE_MS = 900;

export type ReportIncidentStepTwoProps = Readonly<{
  form: ReportIncidentFormState;
  onChange: (next: Partial<ReportIncidentFormState>) => void;
  onBack?: () => void;
  onContinue?: () => void;
  className?: string;
}>;

export function validateStepTwo(form: ReportIncidentFormState): string | null {
  if (!form.objectInvolved.trim()) {
    return "Enter the object involved.";
  }
  if (!form.mechanismOfInjury.trim()) {
    return "Select a mechanism of injury.";
  }
  if (!form.description.trim()) {
    return "Describe the incident in detail.";
  }
  return null;
}

export function ReportIncidentStepTwo(
  props: Readonly<ReportIncidentStepTwoProps>,
) {
  const { form, onChange, onBack, onContinue, className = "" } = props;
  const site = useCurrentSite();
  const photos = form.photos ?? [];
  const draftAssist = useDraftAssistMutation();
  const showsDraft =
    form.descriptionDraft.pending || form.descriptionDraft.text !== null;

  const draftInput = buildDraftAssistInput(form);
  const draftKey = draftInputKey(draftInput);
  const wantsDraft =
    canDraftDescription(form) &&
    form.description.trim() === "" &&
    !form.descriptionDraft.dismissed &&
    !form.descriptionDraft.pending &&
    draftKey !== form.descriptionDraft.source;

  useEffect(() => {
    if (!wantsDraft) {
      return;
    }

    const timer = globalThis.setTimeout(() => {
      onChange({
        descriptionDraft: {
          ...form.descriptionDraft,
          pending: true,
          source: draftKey,
        },
      });

      draftAssist
        .mutateAsync(draftInput)
        .then((drafts) => {
          onChange({
            descriptionDraft: {
              text: drafts.description,
              pending: false,
              source: draftKey,
              dismissed: false,
            },
          });
        })
        .catch((error: unknown) => {
          logAiAssistFailure("draft-assist", error);
          onChange({
            descriptionDraft: {
              text: null,
              pending: false,
              source: draftKey,
              dismissed: false,
            },
          });
        });
    }, DRAFT_DEBOUNCE_MS);

    return () => {
      globalThis.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantsDraft, draftKey]);

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
              What happened
            </Text>
            <Text as="p" className="text-ehs-gray text-sm">
              Object, mechanism, and what happened — then photos and witnesses.
            </Text>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-0 pt-[18px] sm:grid-cols-2">
            <div className="pb-[18px] sm:col-span-2">
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
            </div>
            <div className="pb-[18px] sm:col-span-2">
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
          </div>

          <ReportTextareaField
            className="pb-[18px] [&_textarea]:min-h-[164px]"
            label="Describe incident in detail"
            required
            trailingHint="Events before, during & after."
            value={form.description}
            onChange={(event) => {
              const description = event.target.value;
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
            placeholder={showsDraft ? "" : "Describe what happened…"}
            assistant={
              showsDraft ? (
                <AiInFieldDraft
                  draft={form.descriptionDraft.text}
                  pending={form.descriptionDraft.pending}
                  onAccept={(text) =>
                    onChange({
                      description: text,
                      aiAssistedFields: markAiAssisted(
                        form.aiAssistedFields,
                        "description",
                      ),
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
                <AiTextAssistant
                  module="incident"
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
