"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  ReportTextareaField,
  ReportFieldLabel,
} from "@/components/incidents/report/shared/ReportFormField";
import { AiInFieldDraft } from "@/components/ai/AiInFieldDraft";
import {
  markAiAssisted,
  type ReportIncidentFormState,
  IMMEDIATE_ACTION_OPTIONS,
} from "@/forms/incident-module/index";

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

  // Same rule as the injury draft on step 3: no waiting state for a field the
  // reporter has already filled, because the incoming draft is discarded
  // rather than shown.
  const draftPending = form.aiDraftPending && form.actionNotes.trim() === "";
  const showsDraft = draftPending || form.aiDrafts.actionNotes !== null;

  const toggleAction = (id: string) => {
    const isChecked = form.immediateActions.includes(id);
    const nextActions = isChecked
      ? form.immediateActions.filter((a) => a !== id)
      : [...form.immediateActions, id];
    onChange({ immediateActions: nextActions });
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-7.25"
      className={["min-w-0 flex-1", className].filter(Boolean).join(" ")}
    >
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-5">
          {/* Header Title & Subtitle */}
          <div className="flex flex-col gap-1.5">
            <Text
              as="p"
              className="text-ehs-dark-blue text-xs font-bold tracking-wide uppercase"
            >
              Step 4
            </Text>
            <Text
              as="h2"
              className="text-ehs-dark-bg text-[22px] font-bold tracking-[-0.44px]"
            >
              Immediate response
            </Text>
            <Text as="p" className="text-ehs-gray text-sm">
              What&apos;s already been done? This helps us assess containment.
            </Text>
          </div>

          {/* Section 1: Actions taken grid */}
          <div className="flex flex-col gap-1.5 pt-3.5">
            <ReportFieldLabel
              label="Actions taken"
              trailing={
                <Text as="span" className="text-ehs-muted-text text-sm">
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
                      "rounded-2.5 flex min-h-13 cursor-pointer items-center gap-3 border px-4 py-3 text-left transition-all duration-200",
                      isChecked
                        ? "border-ehs-normal-blue/40 bg-ehs-normal-blue/8 shadow-[0_0_0_1px_color-mix(in_oklab,var(--ehs-normal-blue)_6%,transparent)]"
                        : "border-ehs-border bg-ehs-surface/62 hover:border-ehs-border-strong hover:bg-ehs-surface/80",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "rounded-1 flex size-5 shrink-0 items-center justify-center border transition-colors",
                        isChecked
                          ? "bg-ehs-normal-blue border-ehs-normal-blue text-ehs-on-accent"
                          : "border-ehs-border-strong bg-ehs-surface",
                      ].join(" ")}
                    >
                      {isChecked && (
                        <Icon icon="mdi:check" className="size-3.5" />
                      )}
                    </div>
                    <span
                      className={[
                        "text-sm leading-normal font-semibold",
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
          <div className="pt-3.5">
            <ReportTextareaField
              // Taller than it was: the draft controls reserve a strip along
              // the bottom, and at 86px they landed on the text.
              className="[&_textarea]:min-h-37.5"
              label="Other actions or notes"
              trailingHint="Anything else responders should know?"
              value={form.actionNotes}
              onChange={(event) => {
                const actionNotes = event.target.value;
                // Their own words take over: a draft still sitting underneath
                // while they type is an offer they have already answered.
                onChange({
                  actionNotes,
                  ...(form.aiDrafts.actionNotes
                    ? { aiDrafts: { ...form.aiDrafts, actionNotes: null } }
                    : {}),
                });
              }}
              placeholder={
                showsDraft
                  ? ""
                  : "List any additional actions, notifications, or follow-ups already underway…"
              }
              rows={3}
              assistant={
                showsDraft ? (
                  <AiInFieldDraft
                    draft={form.aiDrafts.actionNotes}
                    pending={draftPending}
                    onAccept={(text) =>
                      onChange({
                        actionNotes: text,
                        aiAssistedFields: markAiAssisted(
                          form.aiAssistedFields,
                          "actionNotes",
                        ),
                        aiDrafts: { ...form.aiDrafts, actionNotes: null },
                      })
                    }
                    onDismiss={() =>
                      onChange({
                        aiDrafts: { ...form.aiDrafts, actionNotes: null },
                      })
                    }
                  />
                ) : undefined
              }
            />
          </div>
        </div>

        {/* Form Bottom Toolbar Actions */}
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
