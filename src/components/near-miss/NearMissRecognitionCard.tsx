"use client";

import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";

export type NearMissRecognitionCardProps = Readonly<{ className?: string }>;

/**
 * "Recognition" card — top near-miss reporters for the current month.
 *
 * The reporter list is NOT wired, deliberately. It used to call
 * `GET /api/NearMiss/MonthlyNearMissUsers`, which never existed on the backend:
 * `INearMissService` exposes `GetTopNearMissUsers` and no monthly variant, and
 * route-map.md has no row for it. That call has been 404ing in production, and
 * because the card fell back to its empty state on error it displayed
 * "No reporters yet this month." — which read as a real, empty month rather
 * than a missing feature.
 *
 * Rather than keep firing a request that cannot succeed, the card now states
 * plainly that the data is unavailable. Restore `getMonthlyNearMissUsers` in
 * `near-miss.service.ts` and render the list again once the backend serves
 * `GET /api/v1/near-misses/monthly-users`.
 */
export function NearMissRecognitionCard(props: NearMissRecognitionCardProps) {
  const { className = "" } = props;

  return (
    <IncidentGlassCard className={className}>
      <header className="mb-3 flex flex-col gap-0.5">
        <Text as="h3" className="text3 text-ehs-darker">
          Recognition
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text">
          Top reporters this month
        </Text>
      </header>

      <Text
        as="p"
        className="text8 text-ehs-muted-text border-t border-ehs-border-ink/10 py-2"
      >
        Monthly reporter rankings are not available yet.
      </Text>
    </IncidentGlassCard>
  );
}
