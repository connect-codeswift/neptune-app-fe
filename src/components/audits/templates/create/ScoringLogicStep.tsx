"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { FIELD_INPUT_LG_CLASS } from "@/components/ui/field-styles";
import { Switch } from "./Switch";
import {
  RULE_ACTIONS,
  RULE_OPERATORS,
  RULE_VALUES,
  SCORING_METHODS,
  createRule,
  itemDisplayName,
  type ScoringConfig,
  type ScoringMethod,
  type TemplateRule,
  type TemplateSection,
} from "./template-builder-data";

const labelClass = "text6 text-ehs-muted-text";

/** Same frame as GlassSelect's default trigger, minus the chevron. */
const inputClass = FIELD_INPUT_LG_CLASS;

/** Number of item weight rows shown before the "+N more" note. */
const WEIGHTS_PREVIEW_COUNT = 3;

function Select(
  props: Readonly<{
    value: string;
    placeholder: string;
    options: readonly string[];
    ariaLabel: string;
    onChange: (value: string) => void;
  }>,
) {
  const { value, placeholder, options, ariaLabel, onChange } = props;

  return (
    <GlassSelect
      options={options.map((option) => ({ value: option, label: option }))}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className="min-w-0 flex-1"
    />
  );
}

/** Free-text field styled to match {@link Select}, minus the chevron. */
function TextInput(
  props: Readonly<{
    value: string;
    placeholder: string;
    ariaLabel: string;
    onChange: (value: string) => void;
  }>,
) {
  const { value, placeholder, ariaLabel, onChange } = props;

  return (
    <div className="relative min-w-0 flex-1">
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
        className={[inputClass, "placeholder:text-ehs-muted-text"].join(" ")}
      />
    </div>
  );
}

export type ScoringLogicStepProps = Readonly<{
  sections: TemplateSection[];
  onSectionsChange: (sections: TemplateSection[]) => void;
  scoring: ScoringConfig;
  onScoringChange: (scoring: ScoringConfig) => void;
  rules: TemplateRule[];
  onRulesChange: (rules: TemplateRule[]) => void;
}>;

export function ScoringLogicStep(props: ScoringLogicStepProps) {
  const { sections, scoring, onScoringChange, rules, onRulesChange } = props;

  const items = sections.flatMap((section) => section.items);
  const shownWeights = items.slice(0, WEIGHTS_PREVIEW_COUNT);
  const hiddenWeightCount = items.length - shownWeights.length;

  const patchScoring = (patch: Partial<ScoringConfig>) => {
    onScoringChange({ ...scoring, ...patch });
  };

  const patchRule = (ruleId: string, patch: Partial<TemplateRule>) => {
    onRulesChange(
      rules.map((rule) => (rule.id === ruleId ? { ...rule, ...patch } : rule)),
    );
  };

  return (
    <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-2">
      {/* Scoring Configuration */}
      <IncidentGlassCard
        paddingClassName="p-6"
        incidentGlassCardClassName="gap-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Text as="h2" className="text3 text-ehs-dark-bg">
            Scoring Configuration
          </Text>
          <span className="flex items-center gap-2">
            <span className="text4 text-ehs-gray">Enable Scoring</span>
            <Switch
              checked={scoring.enabled}
              label="Enable scoring"
              onChange={() => patchScoring({ enabled: !scoring.enabled })}
            />
          </span>
        </div>

        {scoring.enabled ? (
          <>
            <div className="flex flex-col gap-2">
              <span className={labelClass}>Scoring Method</span>

              <GlassSelect
                options={SCORING_METHODS.map((method) => ({
                  value: method,
                  label: method,
                }))}
                value={scoring.method}
                onChange={(value) => {
                  patchScoring({ method: value as ScoringMethod });
                }}
                aria-label="Scoring method"
                // The emphasized pill look. GlassSelect's value span carries
                // its own color and the trigger its own text-left, so the
                // pill's blue centered label is re-asserted on the span.
                triggerClassName="border-ehs-normal-blue bg-ehs-normal-blue/15 text5 text-ehs-dark-blue focus:ring-ehs-normal-blue/20 w-full rounded-xl border px-3 py-2.5 text-center transition outline-none focus:ring-2 [&>span]:text-center [&>span]:text-ehs-dark-blue"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className={labelClass}>Pass Threshold</span>
                <span className="text7 text-ehs-dark-blue">
                  {`${String(scoring.passThreshold)}%`}
                </span>
              </div>

              {/* Filled bar with an invisible range on top for interaction. */}
              <div className="relative h-3">
                <div
                  className="absolute inset-0 overflow-hidden rounded-full bg-[#eef1f6]"
                  aria-hidden="true"
                >
                  <div
                    className="bg-ehs-normal-blue h-full rounded-full"
                    style={{ width: `${String(scoring.passThreshold)}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={scoring.passThreshold}
                  aria-label="Pass threshold"
                  onChange={(event) => {
                    patchScoring({ passThreshold: Number(event.target.value) });
                  }}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>

              <div className="text5 mt-2 grid grid-cols-3 gap-2 text-center">
                <span className="text-ehs-green bg-ehs-dark-bg/6 rounded-lg py-2">
                  ≥80% Pass
                </span>
                <span className="text-ehs-yellow bg-ehs-dark-bg/6 rounded-lg py-2">
                  60-79% Amber
                </span>
                <span className="text-ehs-red bg-ehs-dark-bg/6 rounded-lg py-2">
                  &lt;60% Fail
                </span>
              </div>
            </div>

            <p className="text4 text-ehs-normal-blue bg-ehs-dark-bg/6 rounded-lg px-4 py-3">
              (Total Scored ÷ Total Possible) × 100
            </p>

            <div className="flex items-center justify-between gap-3 border-t border-slate-900/10 pt-4">
              <span className="flex flex-col">
                <span className="text5 text-ehs-dark-bg">Score Visibility</span>
                <span className="text4 text-ehs-muted-text">
                  Show score to user while completing form
                </span>
              </span>
              <Switch
                checked={scoring.showScoreToUser}
                label="Score visibility"
                onChange={() => {
                  patchScoring({ showScoreToUser: !scoring.showScoreToUser });
                }}
              />
            </div>

            <div className="flex flex-col gap-2.5 border-t border-slate-900/10 pt-4">
              <h3 className={labelClass}>Item Weights</h3>

              {shownWeights.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {shownWeights.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-lg bg-white p-2"
                    >
                      <span className="text4 text-ehs-gray min-w-0 flex-1 truncate">
                        {itemDisplayName(item)}
                      </span>
                      <span className="focus:border-ehs-normal-blue focus:ring-ehs-normal-blue/20 text7 w-16 shrink-0 rounded-lg border border-slate-900/10 bg-white px-3 py-1.5 text-center outline-none focus:ring-2">
                        {item.scoreWeight}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text4 text-ehs-muted-text">
                  No items yet — add them in Step 2.
                </p>
              )}

              {hiddenWeightCount > 0 ? (
                <p className="text8 text-ehs-muted-text">
                  {`+${String(hiddenWeightCount)} more (edit in Step 2)`}
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-[#0F172A08] px-6 py-8 text-center">
            <Icon
              icon="mdi:chart-bar"
              className="text-ehs-muted-text/30 size-8"
              aria-hidden="true"
            />
            <p className="text4 text-ehs-gray/50">
              Scoring disabled — items will be pass/fail only.
            </p>
          </div>
        )}
      </IncidentGlassCard>

      {/* Conditional Logic */}
      <IncidentGlassCard
        paddingClassName="p-5"
        incidentGlassCardClassName="gap-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Text as="h2" className="text3 text-ehs-dark-bg">
            Conditional Logic
          </Text>
          <button
            type="button"
            onClick={() => onRulesChange([...rules, createRule()])}
            className="bg-ehs-normal-blue/12 text4 text-ehs-dark-blue hover:bg-ehs-normal-blue/20 inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors"
          >
            <Icon icon="mdi:plus" className="size-4" aria-hidden="true" />
            Add Rule
          </button>
        </div>

        <p className="text4 text-ehs-muted-text">
          Define IF/THEN rules to show or hide sections, mark items required, or
          jump to sections based on responses.
        </p>

        {rules.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className="bg-ehs-normal-blue-bg-light flex flex-col gap-3 rounded-xl border border-slate-900/10 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={[
                      "text6 rounded-md px-2 py-0.5",
                      rule.active
                        ? "bg-ehs-normal-blue/15 text-ehs-dark-blue"
                        : "text-ehs-muted-text bg-slate-900/8",
                    ].join(" ")}
                  >
                    {rule.active ? "Active" : "Inactive"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label={rule.active ? "Disable rule" : "Enable rule"}
                      onClick={() =>
                        patchRule(rule.id, { active: !rule.active })
                      }
                      className="text-ehs-muted-text hover:text-ehs-dark-bg cursor-pointer transition-colors"
                    >
                      <Icon
                        icon={
                          rule.active
                            ? "mdi:eye-outline"
                            : "mdi:eye-off-outline"
                        }
                        className="size-5"
                      />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete rule"
                      onClick={() => {
                        onRulesChange(rules.filter((r) => r.id !== rule.id));
                      }}
                      className="text-ehs-red hover:text-ehs-red cursor-pointer opacity-80 transition-opacity hover:opacity-100"
                    >
                      <Icon icon="mdi:trash-can-outline" className="size-5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-ehs-blue/15 text6 text-ehs-blue shrink-0 rounded-md px-2 py-1">
                    IF
                  </span>
                  <TextInput
                    value={rule.ifQuestion}
                    placeholder="Enter question"
                    ariaLabel="If question"
                    onChange={(value) =>
                      patchRule(rule.id, { ifQuestion: value })
                    }
                  />
                  <Select
                    value={rule.ifOperator}
                    placeholder="Condition"
                    options={RULE_OPERATORS}
                    ariaLabel="If operator"
                    onChange={(value) =>
                      patchRule(rule.id, { ifOperator: value })
                    }
                  />
                  <Select
                    value={rule.ifValue}
                    placeholder="Value"
                    options={RULE_VALUES}
                    ariaLabel="If value"
                    onChange={(value) => patchRule(rule.id, { ifValue: value })}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-ehs-green/15 text6 text-ehs-green shrink-0 rounded-md px-2 py-1">
                    THEN
                  </span>
                  <Select
                    value={rule.thenAction}
                    placeholder="Select action"
                    options={RULE_ACTIONS}
                    ariaLabel="Then action"
                    onChange={(value) =>
                      patchRule(rule.id, { thenAction: value })
                    }
                  />
                  <input
                    value={rule.thenValue}
                    placeholder="Value"
                    aria-label="Then value"
                    onChange={(event) => {
                      patchRule(rule.id, { thenValue: event.target.value });
                    }}
                    className={`${FIELD_INPUT_LG_CLASS} min-w-0 flex-1`}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text4 text-ehs-muted-text rounded-xl border border-dashed border-slate-900/15 px-4 py-6 text-center">
            No rules yet. Add one to define conditional behaviour.
          </p>
        )}
      </IncidentGlassCard>
    </div>
  );
}
