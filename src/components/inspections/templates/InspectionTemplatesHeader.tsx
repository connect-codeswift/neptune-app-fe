"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { FIELD_INPUT_LG_CLASS } from "@/components/ui/field-styles";

const crumbMuted = "text8 text-ehs-gray";
const crumbLink =
  "text8 text-ehs-muted-text transition-colors hover:text-ehs-gray";

const actionClass = "text4 h-9 rounded-2.5 px-3 sm:h-9.5";

/** Sent to the API as the `status` query param. */
export const TEMPLATE_STATUS_FILTERS = ["Published", "Draft"] as const;

export type TemplateStatusFilter = (typeof TEMPLATE_STATUS_FILTERS)[number];

export type InspectionTemplatesHeaderProps = Readonly<{
  onCreateTemplate?: () => void;
  status?: TemplateStatusFilter;
  onStatusChange?: (value: TemplateStatusFilter) => void;
}>;

export function InspectionTemplatesHeader(
  props: InspectionTemplatesHeaderProps,
) {
  const { onCreateTemplate, status = "Published", onStatusChange } = props;

  return (
    <div className="backdrop-blur-2.5 bg-ehs-surface/62 border-ehs-border-ink/8 relative flex flex-wrap items-start justify-between gap-3 rounded-2xl border px-4 py-4 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:content-[''] sm:px-6">
      <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 flex-wrap items-center gap-1"
        >
          <span className={crumbMuted}>Compliance</span>
          <Icon
            icon="mdi:chevron-right"
            className="text-ehs-muted-text size-3 shrink-0"
            aria-hidden="true"
          />
          <Link href="/dashboard/inspections" className={crumbLink}>
            Inspections
          </Link>
          <Icon
            icon="mdi:chevron-right"
            className="text-ehs-muted-text size-3 shrink-0"
            aria-hidden="true"
          />
          <span className={crumbMuted}>Templates</span>
        </nav>

        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="h1" className="text1 text-ehs-darker">
            Inspection Templates
          </Text>
          <Text as="p" className="text8 text-ehs-muted-text">
            Manage and use inspection checklists
          </Text>
        </div>
      </div>

      <div className="relative z-1 flex flex-wrap items-center gap-3">
        <GlassSelect
          options={TEMPLATE_STATUS_FILTERS.map((option) => ({
            value: option,
            label: option,
          }))}
          value={status}
          onChange={(value) => onStatusChange?.(value as TemplateStatusFilter)}
          aria-label="Template status"
          className="shrink-0"
          triggerClassName={`${FIELD_INPUT_LG_CLASS} text4`}
        />

        <Button
          type="button"
          variant="primary"
          onClick={onCreateTemplate}
          className={`${actionClass} shrink-0 border-transparent! shadow-none!`}
        >
          <Icon
            icon="mdi:plus"
            className="size-4 shrink-0"
            aria-hidden="true"
          />
          Create Template
        </Button>
      </div>
    </div>
  );
}
