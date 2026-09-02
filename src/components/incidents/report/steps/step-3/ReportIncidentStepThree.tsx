"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { AiTextAssistant } from "@/components/ai/AiTextAssistant";
import { useIncidentFieldDraft } from "@/components/incidents/report/shared/use-incident-draft";
import { buildDraftAssistInput } from "@/components/incidents/report/shared/report-ai-draft";
import {
  markAiAssisted,
  type ReportIncidentFormState,
} from "@/forms/incident-module/index";
import { ReportTextareaField } from "@/components/incidents/report/shared/ReportFormField";
import { ReportBodyPartField } from "@/components/incidents/report/steps/step-3/ReportBodyPartField";
import { ReportIncidentDraftButton } from "@/components/incidents/report/shared/ReportIncidentDraftButton";

export type ReportIncidentStepThreeProps = Readonly<{
  form: ReportIncidentFormState;
  onChange: (next: Partial<ReportIncidentFormState>) => void;
  onBack?: () => void;
  onContinue?: () => void;
  /** Saves the report as a draft in place, without navigating away. */
  onSaveDraft?: () => void;
  /** True while the draft is being written. Blocks a second click mid-save. */
  isSavingDraft?: boolean;
  className?: string;
}>;

export function ReportIncidentStepThree(
  props: Readonly<ReportIncidentStepThreeProps>,
) {
  const {
    form,
    onChange,
    onBack,
    onContinue,
    onSaveDraft,
    isSavingDraft = false,
    className = "",
  } = props;

  const draft = useIncidentFieldDraft(form, onChange, "injuryDescription");

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-7.25"
      className={["min-w-0 flex-1", className].filter(Boolean).join(" ")}
    >
      <div className="flex flex-col gap-7">
        <div className="flex flex-col">
          <div className="flex flex-col gap-1.5">
            <Text
              as="p"
              className="text-ehs-dark-blue text-xs font-bold tracking-wide uppercase"
            >
              Step 3
            </Text>
            <Text
              as="h2"
              className="text-ehs-dark-bg text-[22px] font-bold tracking-[-0.44px]"
            >
              People & injury
            </Text>
            <Text as="p" className="text-ehs-gray text-sm">
              If anyone was hurt, capture the basics now. You can add a full
              investigation later.
            </Text>
          </div>

          {/* Gender moved to Step 1, next to Affected person — it belongs with
              the person's details, not with the injury. */}
          <ReportBodyPartField
            className="pt-5.5"
            bodyParts={form.bodyParts ?? []}
            bodyPartSides={form.bodyPartSides ?? {}}
            bodySide={form.bodySide ?? "Left"}
            onBodyPartsChange={(bodyParts) => onChange({ bodyParts })}
            onBodyPartSidesChange={(bodyPartSides) =>
              onChange({ bodyPartSides })
            }
            onBodySideChange={(bodySide) => onChange({ bodySide })}
            customBodyParts={form.customBodyParts ?? []}
            onCustomBodyPartsChange={(customBodyParts) =>
              onChange({ customBodyParts })
            }
          />

          <div className="pt-4.5">
            {/* Only ever taller than the default, never shorter: the controls
                reserve a strip along the bottom, so squeezing the box puts the
                buttons on top of the text — and a drafted injury description
                needs the room to be readable before it is accepted. */}
            <ReportTextareaField
              className="[&_textarea]:min-h-37.5"
              label="Injury description"
              value={form.injuryDescription}
              onChange={(event) => {
                onChange({ injuryDescription: event.target.value });
              }}
              placeholder="Describe the injury…"
              rows={3}
              assistant={
                <AiTextAssistant
                  module="incident"
                  contextFields={buildDraftAssistInput(form)}
                  value={form.injuryDescription}
                  draftPending={draft.pending}
                  onRegenerateDraft={draft.run}
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
              }
            />
          </div>
        </div>

        <div className="border-ehs-border-ink/8 border-t pt-5.25">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="tertiary"
              onClick={onBack}
              className="rounded-2.5 px-3.75 py-2.5 text-sm font-bold"
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

            <ReportIncidentDraftButton
              onSaveDraft={onSaveDraft}
              isSavingDraft={isSavingDraft}
            />

            <Button
              type="button"
              variant="primary"
              onClick={onContinue}
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
