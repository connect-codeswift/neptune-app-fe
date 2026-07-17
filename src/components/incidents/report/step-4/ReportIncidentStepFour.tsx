"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";
import {
  ReportTextareaField,
  ReportFieldLabel,
} from "@/components/incidents/report/shared/ReportFormField";
import {
  type ReportIncidentFormState,
  IMMEDIATE_ACTION_OPTIONS,
  SUGGESTED_FOLLOW_UP_OPTIONS,
} from "@/components/incidents/report/shared/report-incident-data";

export type ReportIncidentStepFourProps = Readonly<{
  form: ReportIncidentFormState;
  onChange: (next: Partial<ReportIncidentFormState>) => void;
  onBack?: () => void;
  onContinue?: () => void;
  className?: string;
}>;

export function ReportIncidentStepFour(
  props: Readonly<ReportIncidentStepFourProps>,
) {
  const { form, onChange, onBack, onContinue, className = "" } = props;

  const toggleAction = (id: string) => {
    const isChecked = form.immediateActions.includes(id);
    const nextActions = isChecked
      ? form.immediateActions.filter((a) => a !== id)
      : [...form.immediateActions, id];
    onChange({ immediateActions: nextActions });
  };

  const toggleFollowUp = (id: string) => {
    const isChecked = form.suggestedFollowUp.includes(id);
    const nextFollowUp = isChecked
      ? form.suggestedFollowUp.filter((f) => f !== id)
      : [...form.suggestedFollowUp, id];
    onChange({ suggestedFollowUp: nextFollowUp });
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-[29px]"
      className={["min-w-0 flex-1", className].filter(Boolean).join(" ")}
    >
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-5">
          {/* Header Title & Subtitle */}
          <div className="flex flex-col gap-1.5">
            <Text
              as="p"
              className="text-ehs-dark-blue text-[10px] font-bold tracking-[1.4px] uppercase"
            >
              Step 4
            </Text>
            <Text
              as="h2"
              className="text-ehs-dark-bg text-[21.8px] font-bold tracking-[-0.44px]"
            >
              Immediate response
            </Text>
            <Text as="p" className="text-ehs-gray text-[12px]">
              What&apos;s already been done? This helps us assess containment.
            </Text>
          </div>

          {/* Section 1: Actions taken grid */}
          <div className="flex flex-col gap-1.5 pt-[14px]">
            <ReportFieldLabel
              label="Actions taken"
              trailing={
                <Text as="span" className="text-ehs-muted-text text-[11px]">
                  Tap any that apply.
                </Text>
              }
            />
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {IMMEDIATE_ACTION_OPTIONS.map((action) => {
                const isChecked = form.immediateActions.includes(action.id);
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => toggleAction(action.id)}
                    className={[
                      "flex min-h-[52px] cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-3 text-left transition-all duration-200",
                      isChecked
                        ? "border-[#0891a6]/40 bg-[#0891a6]/8 shadow-[0_0_0_1px_rgba(8,145,166,0.06)]"
                        : "border-[rgba(15,23,42,0.08)] bg-white/62 hover:border-[rgba(15,23,42,0.16)] hover:bg-white/80",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "flex size-5 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                        isChecked
                          ? "bg-ehs-normal-blue border-ehs-normal-blue text-white"
                          : "border-[rgba(15,23,42,0.18)] bg-white",
                      ].join(" ")}
                    >
                      {isChecked && (
                        <Icon icon="mdi:check" className="size-3.5" />
                      )}
                    </div>
                    <span
                      className={[
                        "text-[13px] leading-normal font-semibold",
                        isChecked ? "text-ehs-dark-blue" : "text-ehs-dark-bg",
                      ].join(" ")}
                    >
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Other actions or notes text area */}
          <ReportTextareaField
            className="pt-[14px] [&_textarea]:min-h-[86px]"
            label="Other actions or notes"
            trailingHint="Anything else responders should know?"
            value={form.actionNotes}
            onChange={(event) => onChange({ actionNotes: event.target.value })}
            placeholder="List any additional actions, notifications, or follow-ups already underway…"
            rows={3}
          />

          {/* Section 3: Suggested follow-up checkbox list */}
          <div className="flex flex-col gap-2 pt-[14px]">
            <ReportFieldLabel label="Suggested follow-up" />
            <div className="flex flex-col gap-1 rounded-[12px] border border-[rgba(15,23,42,0.08)] bg-white/62 p-3.5">
              {SUGGESTED_FOLLOW_UP_OPTIONS.map((followUp) => {
                const isChecked = form.suggestedFollowUp.includes(followUp.id);
                return (
                  <button
                    key={followUp.id}
                    type="button"
                    onClick={() => toggleFollowUp(followUp.id)}
                    className="-mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-black/[0.01]"
                  >
                    <div
                      className={[
                        "flex size-5 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                        isChecked
                          ? "bg-ehs-normal-blue border-ehs-normal-blue text-white"
                          : "border-[rgba(15,23,42,0.18)] bg-white",
                      ].join(" ")}
                    >
                      {isChecked && (
                        <Icon icon="mdi:check" className="size-3.5" />
                      )}
                    </div>
                    <Text
                      as="span"
                      className={[
                        "text-[13px] transition-colors",
                        isChecked
                          ? "text-ehs-dark-blue font-bold"
                          : "text-ehs-dark-bg font-normal",
                      ].join(" ")}
                    >
                      {followUp.label}
                    </Text>

                    {/* AI Suggested Badge */}
                    <div className="bg-ehs-light-blue text-ehs-dark-blue border-ehs-light-blue-active ml-auto inline-flex items-center gap-1 rounded-full border px-2.5 py-1">
                      <Icon
                        icon="mdi:creation-outline"
                        className="size-3 shrink-0"
                      />
                      <span className="text-[9.5px] font-bold tracking-[0.2px]">
                        AI suggested
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Bottom Toolbar Actions */}
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
