"use client";

import { ReportComingSoonStep } from "@/components/incidents/report/shared/ReportComingSoonStep";
import type { ReportIncidentFormState } from "@/components/incidents/report/shared/report-incident-data";

export type ReportIncidentStepFiveProps = Readonly<{
  form: ReportIncidentFormState;
  onChange: (next: Partial<ReportIncidentFormState>) => void;
  onBack?: () => void;
  onContinue?: () => void;
  className?: string;
}>;

export function ReportIncidentStepFive(
  props: Readonly<ReportIncidentStepFiveProps>,
) {
  const { onBack, onContinue, className } = props;

  return (
    <ReportComingSoonStep
      step={5}
      onBack={onBack}
      onContinue={onContinue}
      className={className}
    />
  );
}
