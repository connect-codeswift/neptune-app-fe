import { HazcomUnavailablePanel } from "@/components/hazcom/shared";

export type HazcomTrainingComplianceCardProps = Readonly<{
  className?: string;
}>;

/**
 * Per-employee training compliance has no data behind it, so this panel says so.
 *
 * The four figures here were hard-coded (89 compliant / 18 due soon / 14 overdue
 * / 6 never trained). Deriving them needs a roster and a per-role training
 * requirement to measure against; the training endpoint returns sessions with an
 * attendee *count* and no attendee identities, so "never trained" in particular
 * cannot be computed from anything the API exposes. The overall session count
 * moved to the KPI row, which the endpoint can answer.
 */
export function HazcomTrainingComplianceCard(
  props: Readonly<HazcomTrainingComplianceCardProps>,
) {
  const { className = "" } = props;

  return (
    <HazcomUnavailablePanel
      title="Training Compliance"
      message="Per-employee compliance needs a trainee roster and role requirements, which the training endpoint doesn't return yet."
      className={className}
    />
  );
}
