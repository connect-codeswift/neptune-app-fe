"use client";

import type { ReactNode } from "react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { FormValues } from "@/components/form-builder";
import type {
  ScoringConfig,
  TemplateRule,
  TemplateSection,
} from "./template-builder-data";

const labelClass = "text9 text-ehs-muted-text";

const DASH = "—";

function CardHeader(props: Readonly<{ title: string; onEdit: () => void }>) {
  const { title, onEdit } = props;

  return (
    <div className="flex items-center justify-between gap-3">
      <Text as="h2" className="text3 text-ehs-dark-bg">
        {title}
      </Text>
      <button
        type="button"
        onClick={onEdit}
        className="text5 text-ehs-normal-blue hover:text-ehs-normal-blue-hover cursor-pointer transition-colors"
      >
        Edit
      </button>
    </div>
  );
}

function Field(props: Readonly<{ label: string; children: ReactNode }>) {
  const { label, children } = props;

  return (
    <div className="bg-ehs-surface flex min-w-0 flex-col gap-1 rounded-lg p-3">
      <span className={labelClass}>{label}</span>
      <span className="text4 text-ehs-dark-bg">{children}</span>
    </div>
  );
}

function GlanceRow(props: Readonly<{ label: string; value: ReactNode }>) {
  const { label, value } = props;

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text4 text-ehs-gray/80">{label}</span>
      <span className="text5 text-ehs-dark-bg">{value}</span>
    </div>
  );
}

export type ReviewPublishStepProps = Readonly<{
  values: FormValues;
  sections: TemplateSection[];
  scoring: ScoringConfig;
  rules: TemplateRule[];
  /** True while a publish/draft request is in flight. */
  isSubmitting?: boolean;
  onEditStep: (step: number) => void;
  onPublish: () => void;
  onSaveDraft: () => void;
}>;

export function ReviewPublishStep(props: ReviewPublishStepProps) {
  const {
    values,
    sections,
    scoring,
    rules,
    isSubmitting = false,
    onEditStep,
    onPublish,
    onSaveDraft,
  } = props;

  const name = String(values.templateName ?? "").trim();
  const tags = (values.tags as string[] | undefined) ?? [];
  const frequency = String(values.frequency ?? "").trim();
  const description = String(values.description ?? "").trim();
  const templateType = String(values.templateType ?? "Audit");

  const totalItems = sections.reduce(
    (sum, section) => sum + section.items.length,
    0,
  );
  const activeRules = rules.filter((rule) => rule.active).length;

  return (
    <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      {/* Review cards */}
      <div className="flex min-w-0 flex-col gap-3.5">
        <IncidentGlassCard
          paddingClassName="p-6"
          incidentGlassCardClassName="gap-5"
        >
          <CardHeader title="Basic Information" onEdit={() => onEditStep(1)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Template Name">{name || DASH}</Field>
            <Field label="Type">{templateType}</Field>
            <Field label="Tags">
              {tags.length > 0 ? tags.join(", ") : DASH}
            </Field>
            <Field label="Frequency">{frequency || DASH}</Field>
            <Field label="Description">{description || DASH}</Field>
          </div>
        </IncidentGlassCard>

        <IncidentGlassCard
          paddingClassName="p-6"
          incidentGlassCardClassName="gap-4"
        >
          <CardHeader title="Sections & Items" onEdit={() => onEditStep(2)} />

          <div className="flex gap-2.5">
            <div className="bg-ehs-normal-blue/8 flex flex-col items-center gap-0.5 rounded-xl px-6 py-3">
              <span className="text2 text-ehs-normal-blue">
                {sections.length}
              </span>
              <span className="text8 text-ehs-gray">Sections</span>
            </div>
            <div className="bg-ehs-green-bg-light/80 flex flex-col items-center gap-0.5 rounded-xl px-6 py-3">
              <span className="text2 text-ehs-green">{totalItems}</span>
              <span className="text8 text-ehs-gray">Total Items</span>
            </div>
          </div>

          <ul className="divide-ehs-border-ink/10 flex flex-col divide-y">
            {sections.map((section) => (
              <li
                key={section.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <span className="text4 text-ehs-gray min-w-0 truncate">
                  {section.title}
                </span>
                <span className="text8 text-ehs-muted-text shrink-0">
                  {`${String(section.items.length)} items`}
                </span>
              </li>
            ))}
          </ul>
        </IncidentGlassCard>

        <IncidentGlassCard
          paddingClassName="p-6"
          incidentGlassCardClassName="gap-4"
        >
          <CardHeader title="Scoring & Logic" onEdit={() => onEditStep(3)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Scoring">
              {scoring.enabled ? "Enabled" : "Disabled"}
            </Field>
            <Field label="Method">
              {scoring.enabled ? scoring.method : DASH}
            </Field>
            <Field label="Pass Threshold">
              {scoring.enabled ? `${String(scoring.passThreshold)}%` : DASH}
            </Field>
            <Field label="Logic Rules">{`${String(activeRules)} active`}</Field>
            <Field label="Score Visibility">
              {scoring.showScoreToUser ? "Visible" : "Hidden"}
            </Field>
          </div>
        </IncidentGlassCard>
      </div>

      {/* Publish + summary */}
      <div className="flex min-w-0 flex-col gap-3.5">
        <IncidentGlassCard
          paddingClassName="p-6"
          incidentGlassCardClassName="gap-5"
        >
          <Text as="h2" className="text3 text-ehs-dark-bg">
            Ready to Publish?
          </Text>
          <p className="text4 text-ehs-gray leading-6">
            Publishing makes this template immediately available in{" "}
            <span className="text5">Start Audit</span>.
          </p>

          <button
            type="button"
            onClick={onPublish}
            disabled={isSubmitting}
            className="text4 bg-ehs-normal-blue hover:bg-ehs-normal-blue-hover active:bg-ehs-normal-blue-active text-ehs-on-accent w-full cursor-pointer rounded-xl px-5 py-2.5 shadow-(--ehs-shadow-button-primary-flat) transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Publishing..." : "Publish Template"}
          </button>

          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSubmitting}
            className="text4 text-ehs-dark-bg border-ehs-border-ink/12 bg-ehs-surface hover:bg-ehs-surface-inverse/5 -mt-1.5 w-full cursor-pointer rounded-xl border px-5 py-2.5 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save as Draft
          </button>
        </IncidentGlassCard>

        <IncidentGlassCard
          paddingClassName="p-6"
          incidentGlassCardClassName="gap-2"
        >
          <h3 className={labelClass}>At a Glance</h3>
          <div className="divide-ehs-border-ink/10 flex flex-col divide-y">
            <GlanceRow label="Name" value={name || DASH} />
            <GlanceRow label="Sections" value={sections.length} />
            <GlanceRow label="Total items" value={totalItems} />
            <GlanceRow label="Scoring" value={scoring.enabled ? "On" : "Off"} />
            <GlanceRow label="Rules" value={rules.length} />
          </div>
        </IncidentGlassCard>
      </div>
    </div>
  );
}
