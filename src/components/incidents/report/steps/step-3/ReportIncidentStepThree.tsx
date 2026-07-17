"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  GENDER_OPTIONS,
  INJURY_LEVEL_OPTIONS,
  type InjuryLevelId,
  type ReportIncidentFormState,
} from "@/components/incidents/report/shared/report-incident-data";
import {
  ReportSelectField,
  ReportTextareaField,
} from "@/components/incidents/report/shared/ReportFormField";
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
              className="text-ehs-dark-blue text-[10px] font-bold tracking-[1.4px] uppercase"
            >
              Step 3
            </Text>
            <Text
              as="h2"
              className="text-ehs-dark-bg text-[21.8px] font-bold tracking-[-0.44px]"
            >
              People & injury
            </Text>
            <Text as="p" className="text-ehs-gray text-[12px]">
              If anyone was hurt, capture the basics now. You can add a full
              investigation later.
            </Text>
          </div>

          <ReportSeverityPicker
            label="Injury level"
            required
            variant="tile"
            value={form.injuryLevel}
            onChange={(injuryLevel: InjuryLevelId) =>
              onChange({ injuryLevel })
            }
            options={INJURY_LEVEL_OPTIONS.map((option) => ({
              id: option.id,
              label: option.label,
              description: option.description,
            }))}
            className="pt-[22px]"
          />

          <div className="w-full max-w-[497px] pt-2 pb-[18px]">
            <ReportSelectField
              label="Gender"
              required
              value={form.gender}
              onChange={(event) => onChange({ gender: event.target.value })}
              options={[...GENDER_OPTIONS]}
            />
          </div>

          <ReportBodyPartField
            bodyParts={form.bodyParts ?? []}
            bodySide={form.bodySide ?? "Left"}
            multiSelect={form.bodyMultiSelect ?? false}
            onBodyPartsChange={(bodyParts) => onChange({ bodyParts })}
            onBodySideChange={(bodySide) => onChange({ bodySide })}
            onMultiSelectChange={(bodyMultiSelect) =>
              onChange({ bodyMultiSelect })
            }
          />

          <ReportTextareaField
            className="pt-[18px] [&_textarea]:min-h-[66px]"
            label="Injury description"
            value={form.injuryDescription}
            onChange={(event) =>
              onChange({ injuryDescription: event.target.value })
            }
            placeholder="Describe the injury…"
            rows={3}
          />
        </div>

        <div className="border-t border-[rgba(15,23,42,0.08)] pt-[21px]">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="tertiary"
              onClick={onBack}
              className="rounded-[10px] px-[15px] py-2.5 text-[13px] font-bold"
            >
              <Icon
                icon="mdi:chevron-left"
                className="size-[13px]"
                aria-hidden="true"
              />
              Back
            </Button>

            <p className="text-ehs-muted-text min-w-0 flex-1 text-[10.8px]">
              Required fields marked with{" "}
              <span className="text-ehs-red">*</span>
            </p>

            <Button
              type="button"
              variant="primary"
              onClick={onContinue}
              className="rounded-[10px] px-[15px] py-2.5 text-[13px] font-bold shadow-[0px_6px_18px_-6px_#0891a6]"
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
