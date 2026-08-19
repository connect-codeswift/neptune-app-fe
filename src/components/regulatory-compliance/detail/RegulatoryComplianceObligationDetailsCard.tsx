"use client";

import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IncidentBadge } from "@/components/incidents/list/IncidentBadge";
import type { IncidentBadgeTone } from "@/components/incidents/list/IncidentBadge";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { formatComplianceDisplayId } from "@/services/mappers/compliance.mapper";
import type { ComplianceObligationDetail } from "../regulatory-compliance-types";

export type RegulatoryComplianceObligationDetailsCardProps = Readonly<{
  detail: ComplianceObligationDetail;
  onMarkAsComplete?: () => void;
  onDelete?: () => void;
  isMarkingComplete?: boolean;
  isDeleting?: boolean;
  className?: string;
}>;

const actionClass = "text4 h-9 rounded-2.5 px-3 sm:h-9.5";

function priorityTone(
  priority: ComplianceObligationDetail["priority"],
): IncidentBadgeTone {
  if (priority === "High") return "danger";
  if (priority === "Medium") return "warn";
  return "muted";
}

function statusTone(
  status: ComplianceObligationDetail["status"],
): IncidentBadgeTone {
  if (status === "Compliant") return "success";
  if (status === "Action required") return "danger";
  if (status === "Due soon") return "warn";
  return "muted";
}

function displayValue(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "—";
}

function DetailField(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;
  const shown = displayValue(value);
  const isEmpty = shown === "—";

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Text as="span" className="text6 text-ehs-muted-text">
        {label}
      </Text>
      <Text
        as="span"
        className={
          isEmpty ? "text4 text-ehs-muted-text" : "text4 text-ehs-darker"
        }
      >
        {shown}
      </Text>
    </div>
  );
}

function SectionTitle(props: Readonly<{ children: string }>) {
  return (
    <Text as="h3" className="text8 text-ehs-muted-text mb-3 font-semibold">
      {props.children}
    </Text>
  );
}

export function RegulatoryComplianceObligationDetailsCard(
  props: RegulatoryComplianceObligationDetailsCardProps,
) {
  const {
    detail,
    onMarkAsComplete,
    onDelete,
    isMarkingComplete = false,
    isDeleting = false,
    className = "",
  } = props;

  const isCompliant = detail.status === "Compliant";
  const busy = isMarkingComplete || isDeleting;

  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className={[
        "backdrop-blur-2.5 w-full max-w-175 bg-[rgba(255,255,255,0.62)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="border-ehs-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
        <Text as="h2" className="text3 text-ehs-darker">
          Obligation Details
        </Text>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {onDelete ? (
            <Button
              type="button"
              variant="tertiary"
              onClick={onDelete}
              disabled={busy}
              isLoading={isDeleting}
              className={`${actionClass} border-ehs-border text-ehs-gray border bg-white/80 shadow-none`}
            >
              <Icon
                icon="mdi:trash-can-outline"
                className="size-4 shrink-0"
                aria-hidden="true"
              />
              Delete
            </Button>
          ) : null}

          {onMarkAsComplete ? (
            <Button
              type="button"
              variant="primary"
              onClick={onMarkAsComplete}
              disabled={busy || isCompliant}
              isLoading={isMarkingComplete}
              className={[
                actionClass,
                "!border-transparent !shadow-none",
                isCompliant
                  ? "!bg-ehs-gray hover:!bg-ehs-gray"
                  : "!bg-ehs-green hover:!bg-ehs-green/90",
              ].join(" ")}
            >
              <Icon
                icon={isCompliant ? "mdi:check-circle" : "mdi:check"}
                className="size-4 shrink-0"
                aria-hidden="true"
              />
              {isCompliant ? "Completed" : "Mark as Complete"}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-5 px-5 py-5 sm:gap-6 sm:px-6 sm:py-6">
        <section>
          <SectionTitle>Overview</SectionTitle>
          <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
            <DetailField
              label="ID"
              value={formatComplianceDisplayId(detail.id)}
            />
            <DetailField label="Code" value={detail.code} />
            <DetailField label="Category" value={detail.category} />
            <DetailField
              label="Regulatory Body"
              value={detail.regulatoryBody}
            />
            <DetailField label="Responsible" value={detail.responsible} />
            <div className="flex flex-col items-start gap-1">
              <Text as="span" className="text6 text-ehs-muted-text">
                Priority
              </Text>
              <IncidentBadge
                label={detail.priority}
                tone={priorityTone(detail.priority)}
              />
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-[rgba(15,23,42,0.08)]" />

        <section>
          <SectionTitle>Schedule</SectionTitle>
          <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
            <DetailField label="Due Date" value={detail.dueDate} />
            <DetailField label="Recurrence" value={detail.recurrence} />
            <div className="flex flex-col items-start gap-1">
              <Text as="span" className="text6 text-ehs-muted-text">
                Status
              </Text>
              <IncidentBadge
                label={detail.status}
                tone={statusTone(detail.status)}
                showDot
              />
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-[rgba(15,23,42,0.08)]" />

        <section>
          <SectionTitle>Completion</SectionTitle>
          {isCompliant ? (
            <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
              <DetailField
                label="Completed Date"
                value={detail.completedDate}
              />
              <DetailField
                label="Completed By"
                value={detail.completedByName}
              />
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-xl bg-[rgba(11,19,32,0.04)] px-3 py-2.5">
              <Icon
                icon="mdi:clock-outline"
                className="text-ehs-muted-text mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <Text as="p" className="text4 text-ehs-muted-text">
                Not completed yet. Mark as complete when this obligation is
                finished.
              </Text>
            </div>
          )}
        </section>
      </div>
    </IncidentGlassCard>
  );
}
