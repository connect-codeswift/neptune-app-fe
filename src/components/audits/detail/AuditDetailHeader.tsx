"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";

const crumbMuted = "text8 text-ehs-gray";
const crumbLink =
  "text8 text-ehs-muted-text transition-colors hover:text-ehs-gray";

const actionClass = "text4 h-9 rounded-2.5 px-3 sm:h-9.5";

export type AuditDetailHeaderProps = Readonly<{
  auditId: string;
  subtitle: string;
  /** Omitted until the run is submitted — the report endpoint refuses before that. */
  onGenerateReport?: () => void;
  /** Opens the checklist. Label varies with the run's status. */
  onPerform?: () => void;
  performLabel?: string;
}>;

export function AuditDetailHeader(props: AuditDetailHeaderProps) {
  const { auditId, subtitle, onGenerateReport, onPerform, performLabel } =
    props;

  return (
    <div className="backdrop-blur-2.5 bg-ehs-surface/62 border-ehs-border-ink/8 relative flex flex-col justify-center gap-1.5 rounded-2xl border px-4 py-4 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:content-[''] sm:px-6">
      <nav
        aria-label="Breadcrumb"
        className="relative z-1 flex min-w-0 flex-wrap items-center gap-1"
      >
        <span className={crumbMuted}>Compliance</span>
        <Icon
          icon="mdi:chevron-right"
          className="text-ehs-muted-text size-3 shrink-0"
          aria-hidden="true"
        />
        <Link href="/dashboard/audits" className={crumbLink}>
          Audits
        </Link>
        <Icon
          icon="mdi:chevron-right"
          className="text-ehs-muted-text size-3 shrink-0"
          aria-hidden="true"
        />
        <span className={`${crumbMuted} truncate`}>{auditId}</span>
      </nav>

      <div className="relative z-1 flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="h1" className="text1 text-ehs-darker break-words">
            {auditId}
          </Text>
          {subtitle ? (
            <Text as="p" className="text8 text-ehs-muted-text">
              {subtitle}
            </Text>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {onPerform ? (
            <Button
              type="button"
              variant="primary"
              onClick={onPerform}
              className={`${actionClass} shrink-0 border-transparent! shadow-none!`}
            >
              <Icon
                icon="mdi:clipboard-check-outline"
                className="size-4 shrink-0"
                aria-hidden="true"
              />
              {performLabel ?? "Perform Audit"}
            </Button>
          ) : null}

          {onGenerateReport ? (
            <Button
              type="button"
              variant="secondary"
              onClick={onGenerateReport}
              className={`${actionClass} shrink-0`}
            >
              <Icon
                icon="mdi:file-document-outline"
                className="size-4 shrink-0"
                aria-hidden="true"
              />
              Generate Report
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
