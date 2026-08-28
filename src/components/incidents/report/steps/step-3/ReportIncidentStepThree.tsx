"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { AiInFieldDraft } from "@/components/ai/AiInFieldDraft";
import { AiTextAssistant } from "@/components/ai/AiTextAssistant";
import {
  markAiAssisted,
  type ReportIncidentFormState,
} from "@/forms/incident-module/index";
import { ReportTextareaField } from "@/components/incidents/report/shared/ReportFormField";
import { ReportBodyPartField } from "@/components/incidents/report/steps/step-3/ReportBodyPartField";

export type ReportIncidentStepThreeProps = Readonly<{
  form: ReportIncidentFormState;
  onChange: (next: Partial<ReportIncidentFormState>) => void;
  onBack?: () => void;
  onContinue?: () => void;
  className?: string;
}>;

export function ReportIncidentStepThree(
  props: Readonly<ReportIncidentStepThreeProps>,
) {
  const { form, onChange, onBack, onContinue, className = "" } = props;

  // Only wait where a draft could actually land. Once the reporter has written
  // here their words win and the arriving draft is discarded, so a spinner
  // would resolve to nothing every time.
  const draftPending =
    form.aiDraftPending && form.injuryDescription.trim() === "";
  const showsDraft = draftPending || form.aiDrafts.injuryDescription !== null;

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
                const injuryDescription = event.target.value;
                // Their own words take over: a draft still sitting underneath
                // while they type is an offer they have already answered.
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
              // Suppressed while a draft occupies the field — the browser would
              // otherwise paint the placeholder underneath the ghost text.
              placeholder={showsDraft ? "" : "Describe the injury…"}
              rows={3}
              assistant={
                showsDraft ? (
                  <AiInFieldDraft
                    draft={form.aiDrafts.injuryDescription}
                    pending={draftPending}
                    onAccept={(text) =>
                      onChange({
                        injuryDescription: text,
                        aiAssistedFields: markAiAssisted(
                          form.aiAssistedFields,
                          "injuryDescription",
                        ),
                        aiDrafts: { ...form.aiDrafts, injuryDescription: null },
                      })
                    }
                    onDismiss={() =>
                      onChange({
                        aiDrafts: { ...form.aiDrafts, injuryDescription: null },
                      })
                    }
                  />
                ) : (
                  // The rewrite buttons need text to work on, so they only take
                  // the slot back once the draft has been resolved either way.
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
