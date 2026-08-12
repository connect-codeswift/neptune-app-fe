import { HazcomUnavailablePanel } from "@/components/hazcom/shared";

export type HazcomUpcomingDeadlinesCardProps = Readonly<{
  className?: string;
}>;

/**
 * No endpoint serves compliance deadlines, so this panel states that.
 *
 * It previously rendered `COMPLIANCE_DEADLINE_ITEMS` — a hard-coded list naming
 * a person ("J. Merrick") and fixed due dates with fixed day-count badges. The
 * badges never recomputed, so by mid-2026 the card showed items due in April as
 * "6d" away. Nothing here was ever tied to the site's own obligations, which on
 * a compliance dashboard is the one thing a reader would assume.
 *
 * The same fixture is still the default for the app-wide ComplianceDeadlinesCard
 * on /dashboard and needs the same treatment.
 */
export function HazcomUpcomingDeadlinesCard(
  props: Readonly<HazcomUpcomingDeadlinesCardProps>,
) {
  const { className = "" } = props;

  return (
    <HazcomUnavailablePanel
      title="Upcoming Deadlines"
      message="Compliance deadlines will appear here once the API serves them for this site."
      className={className}
    />
  );
}
