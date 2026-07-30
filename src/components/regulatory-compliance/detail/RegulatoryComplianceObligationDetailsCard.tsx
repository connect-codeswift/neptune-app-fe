"use client";

import { IncidentGlassCard, IncidentBadge } from "@/components/incidents";
import type { IncidentBadgeTone } from "@/components/incidents/list/IncidentBadge";
import { Text } from "@/components/Text";
import type { ComplianceObligationDetail } from "../regulatory-compliance-types";

export type RegulatoryComplianceObligationDetailsCardProps = Readonly<{
  detail: ComplianceObligationDetail;
  className?: string;
}>;

function priorityTone(
  priority: ComplianceObligationDetail["priority"],
): IncidentBadgeTone {
  if (priority === "High") return "danger";
  if (priority === "Medium") return "warn";
  return "muted";
}

function DetailField(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;

  return (
    <div className="flex flex-col gap-1">
      <Text as="span" className="text-ehs-muted-text text-[12px] font-normal">
        {label}
      </Text>
      <Text as="span" className="text-ehs-dark-bg text-[14px] font-light">
        {value}
      </Text>
    </div>
  );
}

export function RegulatoryComplianceObligationDetailsCard(
  props: RegulatoryComplianceObligationDetailsCardProps,
) {
  const { detail, className = "" } = props;

  const isCompliant = detail.status === "Compliant";

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className={[
        "max-w-[700px] bg-[rgba(255,255,255,0.62)] backdrop-blur-[10px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-6">
        <Text
          as="h2"
          className="text-ehs-dark-bg text-[18px] leading-tight font-bold"
        >
          Obligation Details
        </Text>

        <div className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2">
          <DetailField label="Category" value={detail.category} />
          <DetailField label="Due Date" value={detail.dueDate} />
          <DetailField label="Recurrence" value={detail.recurrence} />
          <DetailField label="Responsible" value={detail.responsible} />
          <DetailField label="Regulatory Body" value={detail.regulatoryBody} />

          {/* Priority */}
          <div className="flex flex-col items-start gap-1">
            <Text
              as="span"
              className="text-ehs-muted-text text-[12px] font-medium"
            >
              Priority
            </Text>
            <IncidentBadge
              label={detail.priority}
              tone={priorityTone(detail.priority)}
            />
          </div>

          {/* Status */}
          <div className="flex flex-col items-start gap-1">
            <Text
              as="span"
              className="text-ehs-muted-text text-[12px] font-medium"
            >
              Status
            </Text>
            <IncidentBadge
              label={detail.status}
              tone={isCompliant ? "success" : "muted"}
              showDot
            />
          </div>

          <DetailField label="Completed Date" value={detail.completedDate} />
        </div>
      </div>
    </IncidentGlassCard>
  );
}
