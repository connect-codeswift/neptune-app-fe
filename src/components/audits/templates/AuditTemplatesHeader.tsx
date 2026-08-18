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

export type AuditTemplatesHeaderProps = Readonly<{
  onCreateTemplate?: () => void;
  status?: TemplateStatusFilter;
  onStatusChange?: (value: TemplateStatusFilter) => void;
}>;

export function AuditTemplatesHeader(props: AuditTemplatesHeaderProps) {
  const { onCreateTemplate, status = "Published", onStatusChange } = props;

  return (
    <div className="backdrop-blur-2.5 relative flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 px-4 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] sm:px-6">
      <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 flex-wrap items-center gap-1"
        >
          <span className={crumbMuted}>Compliance</span>
          <Icon
            icon="mdi:chevron-right"
            className="size-3 shrink-0 text-[#8892a3]"
            aria-hidden="true"
          />
          <Link href="/dashboard/audits" className={crumbLink}>
            Audits
          </Link>
          <Icon
            icon="mdi:chevron-right"
            className="size-3 shrink-0 text-[#8892a3]"
            aria-hidden="true"
          />
          <span className={crumbMuted}>Templates</span>
        </nav>

        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="h1" className="text1 text-ehs-darker">
            Audit Templates
          </Text>
          <Text as="p" className="text8 text-ehs-muted-text">
            Manage and use audit checklists
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
