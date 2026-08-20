"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Button } from "@/components/ui/Button";
import { formatComplianceDisplayId } from "@/services/mappers/compliance.mapper";
import { CompliancePill } from "./compliance-ui";
import type { ComplianceObligationDetail } from "./regulatory-compliance-types";

export type RegulatoryComplianceDetailPanelProps = Readonly<{
  detail: ComplianceObligationDetail | null;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  className?: string;
}>;

function MetaField(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Text as="p" className="text6 text-ehs-muted-text">
        {label}
      </Text>
      <Text as="p" className="text4 text-ehs-darker">
        {value}
      </Text>
    </div>
  );
}

export function RegulatoryComplianceDetailPanel(
  props: Readonly<RegulatoryComplianceDetailPanelProps>,
) {
  const {
    detail,
    isLoading = false,
    errorMessage = null,
    onRetry,
    className = "",
  } = props;

  if (isLoading) {
    return (
      <IncidentGlassCard
        paddingClassName="p-4.5"
        className={["min-h-60 min-w-0", className].filter(Boolean).join(" ")}
        incidentGlassCardClassName="items-center justify-center gap-2"
      >
        <Icon
          icon="mdi:loading"
          className="text-ehs-normal-blue size-7 animate-spin"
          aria-hidden="true"
        />
        <Text as="p" className="text4 text-ehs-muted-text">
          Loading obligation details…
        </Text>
      </IncidentGlassCard>
    );
  }

  if (errorMessage) {
    return (
      <IncidentGlassCard
        paddingClassName="p-4.5"
        className={["min-h-60 min-w-0", className].filter(Boolean).join(" ")}
        incidentGlassCardClassName="items-center justify-center gap-2"
      >
        <Icon
          icon="mdi:alert-circle-outline"
          className="text-ehs-red size-8"
          aria-hidden="true"
        />
        <Text as="p" className="text4 text-ehs-darker">
          Could not load details
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text text-center">
          {errorMessage}
        </Text>
        {onRetry ? (
          <Button
            type="button"
            variant="secondary"
            onClick={onRetry}
            className="mt-1"
          >
            Retry
          </Button>
        ) : null}
      </IncidentGlassCard>
    );
  }

  if (!detail) {
    return (
      <IncidentGlassCard
        paddingClassName="p-4.5"
        className={["min-h-60 min-w-0", className].filter(Boolean).join(" ")}
        incidentGlassCardClassName="items-center justify-center"
      >
        <Text as="p" className="text4 text-ehs-muted-text">
          Select an obligation to view details.
        </Text>
      </IncidentGlassCard>
    );
  }

  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className={["flex min-w-0 flex-col", className].filter(Boolean).join(" ")}
    >
      <div className="border-ehs-border border-b px-5 pt-4.5 pb-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <Text as="span" className="text7 text-ehs-muted-text">
            {formatComplianceDisplayId(detail.id)}
          </Text>

          <Link
            href={`/dashboard/regulatory-compliance/${encodeURIComponent(detail.id)}`}
            className="border-ehs-border text-ehs-normal-blue hover:bg-ehs-light-blue/40 text5 bg-ehs-surface inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors"
          >
            Open details
            <Icon
              icon="mdi:arrow-right"
              className="size-3.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <Text as="h2" className="text3 text-ehs-darker">
          {detail.title}
        </Text>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <CompliancePill label={detail.status} />
          <Text as="p" className="text8 text-ehs-muted-text">
            {detail.category}
          </Text>
        </div>
      </div>

      <div className="border-ehs-border grid grid-cols-2 gap-x-4 gap-y-4 border-b px-5 py-3.5">
        <MetaField label="Due date" value={detail.dueDate} />
        <MetaField label="Recurrence" value={detail.recurrence} />
        <MetaField label="Responsible" value={detail.responsible} />
        <MetaField label="Priority" value={detail.priority} />
        <MetaField label="Regulatory body" value={detail.regulatoryBody} />
        <MetaField label="Completed" value={detail.completedDate} />
      </div>
    </IncidentGlassCard>
  );
}
