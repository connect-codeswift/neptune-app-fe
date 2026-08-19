"use client";

import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { SkeletonListRows } from "@/components/ui/skeletons";
import type { HazardRecognitionDto } from "@/dtos/res/hazard-response.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useHazardRecognitionsQuery } from "@/hooks/use-hazard-queries";

/** "Mian Hamid Ur Rehman" -> "MH". Falls back to "?" for a blank name. */
function initialsOf(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "");

  return letters.join("") || "?";
}

type RecognitionBodyProps = Readonly<{
  reporters: readonly HazardRecognitionDto[];
  isPending: boolean;
  isError: boolean;
  error: unknown;
}>;

/**
 * Rows, skeleton, error, or empty copy — sequential returns, never nested
 * ternaries. The error branch is load-bearing: without it a 400/403/500 renders
 * as "No reporters yet this month" and looks like an empty month.
 */
function RecognitionBody(props: RecognitionBodyProps) {
  const { reporters, isPending, isError, error } = props;

  if (isPending) {
    return (
      <div className="border-ehs-border-ink/10 border-t pt-3">
        <SkeletonListRows rows={4} />
      </div>
    );
  }

  if (isError) {
    return (
      <Text
        as="p"
        className="text4 text-ehs-red border-ehs-border-ink/10 border-t py-2"
      >
        {getMutationErrorMessage(error, "Could not load top reporters.")}
      </Text>
    );
  }

  if (reporters.length === 0) {
    return (
      <Text
        as="p"
        className="text8 text-ehs-muted-text border-ehs-border-ink/10 border-t py-2"
      >
        No reporters yet this month.
      </Text>
    );
  }

  return (
    <ul className="flex flex-col">
      {reporters.map((reporter) => (
        <li
          key={reporter.userId}
          className="border-ehs-border-ink/10 flex items-center gap-2.5 border-t py-3"
        >
          <Text
            as="span"
            className="text7 bg-ehs-normal-blue/18 text-ehs-dark-blue flex size-7 shrink-0 items-center justify-center rounded-lg font-bold"
          >
            {initialsOf(reporter.userName)}
          </Text>
          <Text
            as="span"
            className="text4 text-ehs-darker min-w-0 flex-1 truncate"
          >
            {reporter.userName}
          </Text>
          <Text as="span" className="text4 text-ehs-darker tabular-nums">
            {String(reporter.hazardCount)}
          </Text>
        </li>
      ))}
    </ul>
  );
}

export type HazardRecognitionCardProps = Readonly<{ className?: string }>;

export function HazardRecognitionCard(props: HazardRecognitionCardProps) {
  const { className = "" } = props;

  const now = new Date();
  const recognitionsQuery = useHazardRecognitionsQuery({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });
  const reporters = recognitionsQuery.data?.dataModel ?? [];

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

      <RecognitionBody
        reporters={reporters}
        isPending={recognitionsQuery.isPending}
        isError={recognitionsQuery.isError}
        error={recognitionsQuery.error}
      />
    </IncidentGlassCard>
  );
}
