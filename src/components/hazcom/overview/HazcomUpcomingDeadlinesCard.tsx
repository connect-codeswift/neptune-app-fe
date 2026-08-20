"use client";
import { EmptyState } from "@/components/ui/EmptyState";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { Text } from "@/components/Text";
import { HazcomBadge, type HazcomBadgeTone } from "@/components/hazcom/shared";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { HazcomOverviewState } from "@/hooks/use-hazcom-overview";

export type HazcomUpcomingDeadlinesCardProps = Readonly<{
  overview: HazcomOverviewState;
  className?: string;
}>;

function daysLeftTone(daysLeft: number | null): HazcomBadgeTone {
  if (daysLeft === null) return "muted";
  if (daysLeft <= 0) return "danger";
  if (daysLeft <= 7) return "warn";
  return "muted";
}

function deadlineHref(type: string): string {
  const lower = type.trim().toLowerCase();
  if (lower.includes("train")) return "/dashboard/hazcom/training";
  if (lower.includes("sds")) return "/dashboard/hazcom/sds";
  if (lower.includes("risk")) return "/dashboard/hazcom/risk-assessments";
  if (lower.includes("chemical") || lower.includes("inventory")) {
    return "/dashboard/hazcom/chemicals";
  }
  return "/dashboard/hazcom/overview";
}

function deadlineIcon(type: string): string {
  const lower = type.trim().toLowerCase();
  if (lower.includes("train")) return "mdi:account-school-outline";
  if (lower.includes("sds")) return "mdi:file-document-outline";
  if (lower.includes("risk")) return "mdi:alert-decagram-outline";
  if (lower.includes("chemical")) return "mdi:flask-outline";
  return "mdi:calendar-clock-outline";
}

/** Upcoming deadlines from GET /api/hazcom/dashboard/upcoming-deadlines. */
export function HazcomUpcomingDeadlinesCard(
  props: Readonly<HazcomUpcomingDeadlinesCardProps>,
) {
  const { overview, className = "" } = props;
  const { upcomingDeadlines } = overview;

  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      className={["min-w-0", className].filter(Boolean).join(" ")}
    >
      <Text as="h2" className="text3 text-ehs-darker">
        Upcoming Deadlines
      </Text>

      {upcomingDeadlines.length === 0 ? (
        <EmptyState
          variant="plain"
          icon="mdi:calendar-blank-outline"
          title="No upcoming deadlines"
          message="Training and review dates appear here as they approach."
          className="flex-1"
        />
      ) : (
        <div className="divide-ehs-border mt-4 flex flex-col divide-y">
          {upcomingDeadlines.map((deadline) => {
            const subtitle = [deadline.type, deadline.owner, deadline.dueDate]
              .filter(Boolean)
              .join(" · ");

            return (
              <Link
                key={`${deadline.type}-${deadline.id}-${deadline.dueDate}`}
                href={deadlineHref(deadline.type)}
                className="hover:bg-ehs-light-bg/40 -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors first:mt-1"
              >
                <span className="bg-ehs-surface-inverse/6 text-ehs-gray flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <Icon
                    icon={deadlineIcon(deadline.type)}
                    className="size-4"
                    aria-hidden="true"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <Text as="p" className="text4 text-ehs-darker truncate">
                    {deadline.title}
                  </Text>
                  {subtitle ? (
                    <Text as="p" className="text8 text-ehs-muted-text truncate">
                      {subtitle}
                    </Text>
                  ) : null}
                </div>
                <HazcomBadge
                  label={deadline.daysLeftLabel}
                  tone={daysLeftTone(deadline.daysLeft)}
                  className="shrink-0"
                />
              </Link>
            );
          })}
        </div>
      )}
    </IncidentGlassCard>
  );
}
