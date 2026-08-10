"use client";

import { Icon } from "@iconify/react";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  ReportTextareaField,
  ReportFieldLabel,
  ReportSelectField,
} from "@/components/incidents/report/shared/ReportFormField";
import { AiInFieldDraft } from "@/components/ai/AiInFieldDraft";
import {
  markAiAssisted,
  STEP_FOUR_CLASSIFICATION_FIELDS,
  YES_NO_OPTIONS,
  type ReportIncidentFormState,
  IMMEDIATE_ACTION_OPTIONS,
} from "@/components/incidents/report/shared/report-incident-data";
import { ReportDerivedClassificationBanner } from "@/components/incidents/report/shared/ReportDerivedClassificationBanner";
import { toast } from "@/lib/toast";

export type ReportIncidentStepFourProps = Readonly<{
  form: ReportIncidentFormState;
  onChange: (next: Partial<ReportIncidentFormState>) => void;
  onBack?: () => void;
  onContinue?: () => void;
  className?: string;
}>;

export function validateStepFour(form: ReportIncidentFormState): string | null {
  for (const field of STEP_FOUR_CLASSIFICATION_FIELDS) {
    if (!form.classifications[field.id]) {
      return `Answer "${field.label}".`;
    }
  }

  if (!form.oshaNotificationRequired) {
    return 'Answer "OSHA Notification Required?".';
  }

  return null;
}

export function ReportIncidentStepFour(
  props: Readonly<ReportIncidentStepFourProps>,
) {
  const { form, onChange, onBack, onContinue, className = "" } = props;

  const draftPending = form.aiDraftPending && form.actionNotes.trim() === "";
  const showsDraft = draftPending || form.aiDrafts.actionNotes !== null;

  // Auto-tick when treatment includes first aid — only when treatment changes,
  // so a reporter who unticks stays in control.
  useEffect(() => {
    if (
      !form.initialTreatment.includes("first-aid-on-site") ||
      form.immediateActions.includes("first-aid")
    ) {
      return;
    }

    onChange({
      immediateActions: [...form.immediateActions, "first-aid"],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.initialTreatment]);

  const toggleAction = (id: string) => {
    const isChecked = form.immediateActions.includes(id);
    const nextActions = isChecked
      ? form.immediateActions.filter((action) => action !== id)
      : [...form.immediateActions, id];
    onChange({ immediateActions: nextActions });
  };

  const handleContinue = () => {
    const validationError = validateStepFour(form);
    if (validationError) {
      toast.error("Missing required fields", validationError);
      return;
    }
    onContinue?.();
  };

  const workRelatedField = STEP_FOUR_CLASSIFICATION_FIELDS[0];
  const sifPotentialField = STEP_FOUR_CLASSIFICATION_FIELDS[1];
  const remainingFields = STEP_FOUR_CLASSIFICATION_FIELDS.slice(2);

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-[29px]"
      className={["min-w-0 flex-1", className].filter(Boolean).join(" ")}
    >
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-5">
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
              Classification & immediate response
            </Text>
            <Text as="p" className="text-ehs-gray text-sm">
              Answer the judgment calls after describing what happened, then note
              what was already done on site.
            </Text>
          </div>

          <ReportDerivedClassificationBanner
            severity={form.severity}
            sipAnswer={form.classifications.serious}
          />

          <div className="grid grid-cols-1 gap-x-3 gap-y-0 sm:grid-cols-2">
            {[workRelatedField, sifPotentialField].map((field) => (
              <div key={field.id} className="pb-[18px]">
                <ReportSelectField
                  label={field.label}
                  required
                  hint={field.hint}
                  value={form.classifications[field.id] ?? ""}
                  onChange={(answer) =>
                    onChange({
                      classifications: {
                        ...form.classifications,
                        [field.id]: answer as "Yes" | "No",
                      },
                    })
                  }
                  options={[...YES_NO_OPTIONS]}
                />
              </div>
            ))}

            <div className="pb-[18px]">
              <ReportSelectField
                label="OSHA Notification Required?"
                required
                hint="Required for fatality (8 hrs), in-patient hospitalization, amputation, or loss of an eye (24 hrs) — 1904.39."
                value={form.oshaNotificationRequired}
                onChange={(answer) =>
                  onChange({
                    oshaNotificationRequired: answer as "Yes" | "No",
                  })
                }
                options={[...YES_NO_OPTIONS]}
              />
            </div>

            {remainingFields.map((field) => (
              <div key={field.id} className="pb-[18px]">
                <ReportSelectField
                  label={field.label}
                  required
                  hint={field.hint}
                  value={form.classifications[field.id] ?? ""}
                  onChange={(answer) =>
                    onChange({
                      classifications: {
                        ...form.classifications,
                        [field.id]: answer as "Yes" | "No",
                      },
                    })
                  }
                  options={[...YES_NO_OPTIONS]}
                />
              </div>
            ))}
          </div>

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
                      {isChecked ? (
                        <Icon icon="mdi:check" className="size-3.5" />
                      ) : null}
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

          <div className="pt-[14px]">
            <ReportTextareaField
              className="[&_textarea]:min-h-[150px]"
              label="Other actions or notes"
              trailingHint="Anything else responders should know?"
              value={form.actionNotes}
              onChange={(event) => {
                const actionNotes = event.target.value;
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
