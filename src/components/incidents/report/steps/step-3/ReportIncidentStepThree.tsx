"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { AiDraftSuggestion } from "@/components/ai/AiDraftSuggestion";
import {
  INJURY_LEVEL_OPTIONS,
  markAiAssisted,
  type InjuryLevelId,
  type ReportIncidentFormState,
} from "@/components/incidents/report/shared/report-incident-data";
import { ReportTextareaField } from "@/components/incidents/report/shared/ReportFormField";
import { ReportSeverityPicker } from "@/components/incidents/report/steps/step-1/ReportSeverityPicker";
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

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-[29px]"
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
              className="text-ehs-dark-bg text-[21.8px] font-bold tracking-[-0.44px]"
            >
              People & injury
            </Text>
            <Text as="p" className="text-ehs-gray text-sm">
              If anyone was hurt, capture the basics now. You can add a full
              investigation later.
            </Text>
          </div>

          <ReportSeverityPicker
            label="Injury level"
            required
            variant="tile"
            value={form.injuryLevel}
            onChange={(injuryLevel: InjuryLevelId) => onChange({ injuryLevel })}
            options={INJURY_LEVEL_OPTIONS.map((option) => ({
              id: option.id,
              label: option.label,
              description: option.description,
            }))}
            className="pt-[22px]"
          />

          {/* Gender moved to Step 1, next to Affected person — it belongs with
              the person's details, not with the injury. */}
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
              className="[&_textarea]:min-h-[66px]"
              label="Injury description"
              value={form.injuryDescription}
              onChange={(event) =>
                onChange({ injuryDescription: event.target.value })
              }
              placeholder="Describe the injury…"
              rows={3}
            />
            <AiDraftSuggestion
              draft={form.aiDrafts.injuryDescription}
              // Only wait where a draft could actually land. Once the reporter
              // has written here their words win, and the arriving draft is
              // discarded — so a spinner would resolve to nothing every time.
              pending={
                form.aiDraftPending && form.injuryDescription.trim() === ""
              }
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
              onClick={onContinue}
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
