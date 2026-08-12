import { CardHeading } from "@/components/CardHeading";
import { Text } from "@/components/Text";
import { GlassCard } from "@/components/ui/GlassCard";

export type ComplianceDeadlinesItem = Readonly<{
  title: string;
  subtitle: string;
  badge: string;
  emphasis?: string;
}>;

export const COMPLIANCE_DEADLINE_ITEMS: readonly ComplianceDeadlinesItem[] = [
  {
    title: "OSHA 300A Annual Summary Posting",
    subtitle: "Due 2026-04-30 · J. Merrick",
    badge: "6d",
  },
  {
    title: "Fire Extinguisher Monthly Inspection",
    subtitle: "Due 2026-04-30 · Facilities",
    badge: "8d",
  },
  {
    title: "Hearing Conservation Audiometric Testing",
    subtitle: "Due 2026-05-08 · Occupational Health",
    badge: "14d",
  },
  {
    title: "Air Emissions Permit Renewal — Stack 3",
    subtitle: "Due 2026-05-12 · Env. Compliance",
    badge: "18d",
  },
  {
    title: "Confined Space Permit Review",
    subtitle: "Due 2026-05-20 · Ops Safety",
    badge: "26d",
  },
];

export const RECENT_ACTIVITY_ITEMS: readonly ComplianceDeadlinesItem[] = [
  {
    emphasis: "Maria Lopez",
    title: "Reported hazard · Press Room",
    subtitle: "Plant A · 09:12",
    badge: "High",
  },
  {
    emphasis: "James Chen",
    title: "Closed incident INC-2025-DET-001",
    subtitle: "Plant A · 09:04",
    badge: "Medium",
  },
  {
    emphasis: "System",
    title: "Automated compliance alert · OSHA 300A due in 6 days",
    subtitle: "Plant A · 08:55",
    badge: "Info",
  },
  {
    emphasis: "Sarah Mitchell",
    title: "Assigned CAPA A-8421 to maintenance team",
    subtitle: "Plant A · 08:41",
    badge: "Info",
  },
  {
    emphasis: "Tom Reyes",
    title: "Uploaded LOTO procedure revision",
    subtitle: "Plant B · 08:30",
    badge: "Info",
  },
  {
    emphasis: "Aisha Patel",
    title: "Flagged near miss · forklift route conflict",
    subtitle: "Warehouse 3 · 08:17",
    badge: "Medium",
  },
];

export function ListItemRow(props: Readonly<ComplianceDeadlinesItem>) {
  const { title, subtitle, badge, emphasis } = props;

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-ehs-slate text-xs leading-snug">
          {emphasis ? (
            <>
              <span className="text-ehs-dark-bg font-semibold">{emphasis}</span>{" "}
              {title}
            </>
          ) : (
            <span className="text-ehs-dark-bg font-medium">{title}</span>
          )}
        </p>
        <Text as="p" className="text-ehs-muted-text mt-0.5 text-2.75">
          {subtitle}
        </Text>
      </div>

      <span className="border-ehs-border/70 bg-ehs-light-bg/70 text-ehs-gray shrink-0 rounded-full border px-2.5 py-0.75 text-2.75 font-semibold">
        {badge}
      </span>
    </div>
  );
}

export type ComplianceDeadlinesCardProps = Readonly<{
  title?: string;
  subtitle?: string;
  items?: readonly ComplianceDeadlinesItem[];
  viewAllHref?: string;
  showDividers?: boolean;
  className?: string;
}>;

export function ComplianceDeadlinesCard(
  props: Readonly<ComplianceDeadlinesCardProps>,
) {
  const {
    title = "Compliance Deadlines",
    subtitle = "Next 60 days",
    items = COMPLIANCE_DEADLINE_ITEMS,
    viewAllHref = "/dashboard/regulatory-compliance",
    showDividers = false,
    className = "",
  } = props;

  return (
    <GlassCard className={className}>
      <CardHeading
        title={title}
        subtitle={subtitle}
        viewAllHref={viewAllHref}
      />

      <div
        className={
          showDividers
            ? "divide-ehs-border/60 mt-1.75 flex flex-col divide-y"
            : "mt-1.75 flex flex-col gap-3.5"
        }
      >
        {items.map((item) => (
          <div
            key={`${item.title}-${item.subtitle}`}
            className={showDividers ? "py-3 first:pt-0 last:pb-0" : undefined}
          >
            <ListItemRow {...item} />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
