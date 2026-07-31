import { Text } from "@/components/Text";
import {
  COMPLIANCE_DEADLINE_ITEMS,
  ListItemRow,
} from "@/components/ComplianceDeadlinesCard";
import { HazcomGlassCard } from "@/components/hazcom/shared";

export type HazcomUpcomingDeadlinesCardProps = Readonly<{
  className?: string;
}>;

/**
 * NOTE: HazCom's shared mock data (`HAZCOM_CHEMICALS` / `HAZCOM_SDS_RECORDS` /
 * `HAZCOM_TRAINING_SESSIONS`) has no generic-deadline records — the approved
 * screenshot's "Upcoming Deadlines" items (OSHA 300A posting, fire
 * extinguisher inspection, permit renewals) are the existing app-wide
 * `COMPLIANCE_DEADLINE_ITEMS` list from `src/components/ComplianceDeadlinesCard.tsx`
 * (same titles/dates/day-counts). Reusing that real, already-existing list
 * (via its exported `ListItemRow`) instead of inventing new literals here.
 */
export function HazcomUpcomingDeadlinesCard(
  props: Readonly<HazcomUpcomingDeadlinesCardProps>,
) {
  const { className = "" } = props;

  return (
    <HazcomGlassCard
      paddingClassName="p-5"
      className={["min-w-0", className].filter(Boolean).join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <Text as="h2" className="text-ehs-darker text-base font-bold">
          Upcoming Deadlines
        </Text>
      </div>

      <div className="divide-ehs-border mt-4 flex flex-col divide-y">
        {COMPLIANCE_DEADLINE_ITEMS.map((item) => (
          <div
            key={`${item.title}-${item.subtitle}`}
            className="py-3 first:pt-0 last:pb-0"
          >
            <ListItemRow {...item} />
          </div>
        ))}
      </div>
    </HazcomGlassCard>
  );
}
