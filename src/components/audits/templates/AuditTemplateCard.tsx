"use client";

import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents";
import { Button } from "@/components/ui/Button";
import type { AuditTemplate } from "@/app/dashboard/audits/templates/audit-templates-data";

export type AuditTemplateCardProps = Readonly<{
  template: AuditTemplate;
  onUse?: (template: AuditTemplate) => void;
  onOptions?: (template: AuditTemplate) => void;
}>;

export function AuditTemplateCard(props: AuditTemplateCardProps) {
  const { template, onUse, onOptions } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      className="min-w-0 bg-white!"
      incidentGlassCardClassName="gap-3"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="text-ehs-muted-text text-sm">
          {`${String(template.sectionCount)} sections · ${String(template.itemCount)} items`}
        </span>

        <button
          type="button"
          aria-label={`Options for ${template.title}`}
          onClick={() => onOptions?.(template)}
          className="text-ehs-muted-text hover:text-ehs-gray -mt-1 shrink-0 cursor-pointer transition-colors"
        >
          <Icon icon="mdi:dots-horizontal" className="size-5" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-ehs-dark-bg text-lg font-bold">{template.title}</h3>
        <p className="text-ehs-gray">
          {`${template.category} · ${template.scope}`}
        </p>
      </div>

      <p className="text-ehs-muted-text text-sm">
        {`Last used: ${template.lastUsed}`}
      </p>

      <Button
        type="button"
        variant="primary"
        onClick={() => onUse?.(template)}
        className="mt-1 w-full justify-center rounded-xl px-4 py-2.5 text-sm font-semibold"
      >
        Use Template
      </Button>
    </IncidentGlassCard>
  );
}
