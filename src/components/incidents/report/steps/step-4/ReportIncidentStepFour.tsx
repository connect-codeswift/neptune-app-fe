"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  ReportTextareaField,
  ReportFieldLabel,
} from "@/components/incidents/report/shared/ReportFormField";
import { AiDraftSuggestion } from "@/components/ai/AiDraftSuggestion";
import {
  createFollowUpItem,
  markAiAssisted,
  type ReportIncidentFormState,
  IMMEDIATE_ACTION_OPTIONS,
} from "@/components/incidents/report/shared/report-incident-data";

/** Mirrors the backend's [MaxLength(500)] on a follow-up's text. */
const FOLLOW_UP_MAX_CHARS = 500;

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
  const [ownFollowUp, setOwnFollowUp] = useState("");

  const toggleAction = (id: string) => {
    const isChecked = form.immediateActions.includes(id);
    const nextActions = isChecked
      ? form.immediateActions.filter((a) => a !== id)
      : [...form.immediateActions, id];
    onChange({ immediateActions: nextActions });
  };

  /**
   * Unchecking keeps the item in state rather than removing it — it is still
   * submitted, flagged unselected, so a declined AI suggestion stays on the
   * record.
   */
  const toggleFollowUp = (id: string) => {
    onChange({
      followUps: form.followUps.map((item) =>
        item.id === id ? { ...item, isSelected: !item.isSelected } : item,
      ),
    });
  };

  const addOwnFollowUp = () => {
    const text = ownFollowUp.trim();

    if (!text) {
      return;
    }

    onChange({
      followUps: [
        ...form.followUps,
        createFollowUpItem(text.slice(0, FOLLOW_UP_MAX_CHARS), {
          isAiSuggested: false,
        }),
      ],
    });
    setOwnFollowUp("");
  };

  const removeFollowUp = (id: string) => {
    onChange({ followUps: form.followUps.filter((item) => item.id !== id) });
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
              className="text-ehs-dark-blue text-xs font-bold tracking-wide uppercase"
            >
              Step 4
            </Text>
            <Text
              as="h2"
              className="text-ehs-dark-bg text-[21.8px] font-bold tracking-[-0.44px]"
            >
              Immediate response
            </Text>
            <Text as="p" className="text-ehs-gray text-sm">
              What&apos;s already been done? This helps us assess containment.
            </Text>
          </div>

          {/* Section 1: Actions taken grid */}
          <div className="flex flex-col gap-1.5 pt-[14px]">
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
          <div className="pt-[14px]">
            <ReportTextareaField
              className="[&_textarea]:min-h-[86px]"
              label="Other actions or notes"
              trailingHint="Anything else responders should know?"
              value={form.actionNotes}
              onChange={(event) => onChange({ actionNotes: event.target.value })}
              placeholder="List any additional actions, notifications, or follow-ups already underway…"
              rows={3}
            />
            <AiDraftSuggestion
              draft={form.aiDrafts.actionNotes}
              // Same rule as the injury draft on step 3: no waiting state for a
              // field the reporter has already filled, because the incoming
              // draft is discarded rather than shown.
              pending={form.aiDraftPending && form.actionNotes.trim() === ""}
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
          </div>

          {/* Section 3: Follow-up actions — AI-suggested plus the reporter's own */}
          <div className="flex flex-col gap-2 pt-[14px]">
            <ReportFieldLabel
              label="Follow-up actions"
              trailing={
                <Text as="span" className="text-ehs-muted-text text-sm">
                  Uncheck anything that doesn&apos;t apply.
                </Text>
              }
            />
            <div className="flex flex-col gap-1 rounded-[12px] border border-[rgba(15,23,42,0.08)] bg-white/62 p-3.5">
              {form.aiDraftPending && form.followUps.length === 0 ? (
                <div className="flex items-center gap-2 px-2 py-2">
                  <Icon
                    icon="svg-spinners:3-dots-fade"
                    className="text-ehs-dark-blue size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <Text as="span" className="text-ehs-muted-text text-sm">
                    Looking for follow-ups…
                  </Text>
                </div>
              ) : null}

              {form.followUps.map((followUp) => (
                <div
                  key={followUp.id}
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-black/[0.01]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      toggleFollowUp(followUp.id);
                    }}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                    aria-pressed={followUp.isSelected}
                  >
                    <div
                      className={[
                        "flex size-5 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                        followUp.isSelected
                          ? "bg-ehs-normal-blue border-ehs-normal-blue text-ehs-light-text"
                          : "border-[rgba(15,23,42,0.18)] bg-white",
                      ].join(" ")}
                    >
                      {followUp.isSelected && (
                        <Icon icon="mdi:check" className="size-3.5" />
                      )}
                    </div>
                    <Text
                      as="span"
                      className={[
                        "min-w-0 flex-1 text-sm transition-colors",
                        followUp.isSelected
                          ? "text-ehs-dark-blue font-bold"
                          : "text-ehs-dark-bg font-normal",
                      ].join(" ")}
                    >
                      {followUp.text}
                    </Text>
                  </button>

                  {followUp.isAiSuggested ? (
                    <div className="bg-ehs-light-blue text-ehs-dark-blue border-ehs-light-blue-active inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1">
                      <Icon
                        icon="mdi:creation-outline"
                        className="size-3 shrink-0"
                      />
                      <span className="text-[9.5px] font-bold tracking-[0.2px]">
                        AI suggested
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        removeFollowUp(followUp.id);
                      }}
                      aria-label={`Remove follow-up: ${followUp.text}`}
                      className="text-ehs-muted-text hover:text-ehs-red shrink-0 cursor-pointer rounded p-1 transition-colors"
                    >
                      <Icon icon="mdi:close" className="size-3.5" />
                    </button>
                  )}
                </div>
              ))}

              {/* Add your own — always available, model or no model. */}
              <div className="mt-1 flex items-center gap-2 border-t border-[rgba(15,23,42,0.06)] pt-2.5">
                <input
                  type="text"
                  value={ownFollowUp}
                  maxLength={FOLLOW_UP_MAX_CHARS}
                  onChange={(event) => {
                    setOwnFollowUp(event.target.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addOwnFollowUp();
                    }
                  }}
                  placeholder="Add your own follow-up…"
                  aria-label="Add your own follow-up"
                  className="text-ehs-dark-bg placeholder:text-ehs-muted-text min-w-0 flex-1 rounded-lg border border-[rgba(15,23,42,0.12)] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(8,145,166,0.45)]"
                />
                <button
                  type="button"
                  onClick={addOwnFollowUp}
                  disabled={!ownFollowUp.trim()}
                  className="text-ehs-dark-blue inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon icon="mdi:plus" className="size-4" aria-hidden="true" />
                  Add
                </button>
              </div>
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
