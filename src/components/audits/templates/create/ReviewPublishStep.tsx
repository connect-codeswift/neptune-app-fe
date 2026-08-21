"use client";

import type { ReactNode } from "react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { FormValues } from "@/components/form-builder";
import { itemDisplayName, type TemplateSection } from "./template-builder-data";

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

export type ReviewPublishStepProps = Readonly<{
  values: FormValues;
  sections: TemplateSection[];
  onEditStep: (step: number) => void;
}>;

export function ReviewPublishStep(props: ReviewPublishStepProps) {
  const { values, sections, onEditStep } = props;

  const name = String(values.templateName ?? "").trim();
  const tags = (values.tags as string[] | undefined) ?? [];
  const frequency = String(values.frequency ?? "").trim();
  const description = String(values.description ?? "").trim();
  const templateType = String(values.templateType ?? "Audit");

  const totalItems = sections.reduce(
    (sum, section) => sum + section.items.length,
    0,
  );

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <IncidentGlassCard
        paddingClassName="p-6"
        incidentGlassCardClassName="gap-5"
      >
        <CardHeader title="Basic Information" onEdit={() => onEditStep(1)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Template Name">{name || DASH}</Field>
          <Field label="Type">{templateType}</Field>
          <Field label="Tags">{tags.length > 0 ? tags.join(", ") : DASH}</Field>
          <Field label="Frequency">{frequency || DASH}</Field>
          <div className="sm:col-span-2">
            <Field label="Description">{description || DASH}</Field>
          </div>
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
            <li key={section.id} className="flex flex-col gap-2 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text4 text-ehs-gray min-w-0 truncate">
                  {section.title || "Untitled"}
                </span>
                <span className="text8 text-ehs-muted-text shrink-0">
                  {`${String(section.items.length)} items`}
                </span>
              </div>

              {section.items.length > 0 ? (
                <ul className="text8 text-ehs-muted-text flex list-disc flex-col gap-1 pl-5">
                  {section.items.map((item) => (
                    <li key={item.id} className="min-w-0 truncate">
                      {itemDisplayName(item)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </IncidentGlassCard>
    </div>
  );
}
