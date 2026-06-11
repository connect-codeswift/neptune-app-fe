import { Icon } from "@iconify/react";
import Link from "next/link";
import { Text } from "@/components/Text";

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

export const MY_ACTIONS_ITEMS: readonly ComplianceDeadlinesItem[] = [
  {
    title: "Replace frayed hydraulic press machine #4",
    subtitle: "A-8421 · Plant A · Line 2 · Corrective Action",
    badge: "3d",
  },
  {
    title: "Install safety guards on grinder Station 3",
    subtitle: "A-8390 · Plant A · Machine Shop · Corrective Action",
    badge: "5d",
  },
  {
    title: "Update chemical storage SOP and labels",
    subtitle: "A-8355 · Plant B · Warehouse 1 · Documentation",
    badge: "8d",
  },
  {
    title: "Schedule forklift operator refresher training",
    subtitle: "A-8312 · Plant A · Loading Dock · Training",
    badge: "10d",
  },
  {
    title: "Review confined space entry permit — Tank 7",
    subtitle: "A-8298 · Plant C · Utilities · Permit Review",
    badge: "13d",
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

function ListItemRow(props: Readonly<ComplianceDeadlinesItem>) {
  const { title, subtitle, badge, emphasis } = props;

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-ehs-darker text-sm leading-snug">
          {emphasis ? (
            <>
              <span className="font-semibold">{emphasis}</span> {title}
            </>
          ) : (
            <span className="font-medium">{title}</span>
          )}
        </p>
        <Text as="p" className="text-ehs-muted-text mt-0.5 text-xs">
          {subtitle}
        </Text>
      </div>

      <span className="border-ehs-border bg-ehs-light-bg text-ehs-gray shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold">
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
    <article
      className={[
        "border-ehs-border bg-ehs-light-text flex flex-col gap-4 rounded-2xl border p-5 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <Text as="h2" className="text-ehs-darker text-base font-bold">
            {title}
          </Text>
          <Text as="p" className="text-ehs-muted-text mt-0.5 text-xs">
            {subtitle}
          </Text>
        </div>

        <Link
          href={viewAllHref}
          className="text-ehs-gray hover:text-ehs-darker inline-flex items-center gap-0.5 text-xs font-medium transition-colors"
        >
          View all
          <Icon icon="mdi:chevron-right" className="text-sm" aria-hidden="true" />
        </Link>
      </div>

      <div
        className={
          showDividers
            ? "divide-ehs-border flex flex-col divide-y"
            : "flex flex-col gap-4"
        }
      >
        {items.map((item) => (
          <div
            key={`${item.title}-${item.subtitle}`}
            className={showDividers ? "py-4 first:pt-0 last:pb-0" : undefined}
          >
            <ListItemRow {...item} />
          </div>
        ))}
      </div>
    </article>
  );
}
