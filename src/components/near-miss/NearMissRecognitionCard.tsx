"use client";

import { useState } from "react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { CardPager } from "@/components/ui/CardPager";
import { SkeletonListRows } from "@/components/ui/skeletons";
import type { NearMissRecognitionDto } from "@/dtos/res/near-miss-response.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useNearMissRecognitionsQuery } from "@/hooks/use-near-miss-queries";

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
  reporters: readonly NearMissRecognitionDto[];
  isPending: boolean;
  isError: boolean;
  error: unknown;
}>;

/**
 * Rows, skeleton, error, or empty copy — sequential returns, never nested
 * ternaries. The error branch is load-bearing: without it a 400/403/500 renders
 * as "No reporters yet this month" and looks like an empty month.
 */
/** Reporters drawn at once. Five names read as a leaderboard; twenty read as a list. */
const REPORTERS_PER_PAGE = 5;

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
            {String(reporter.nearMissCount)}
          </Text>
        </li>
      ))}
    </ul>
  );
}

export type NearMissRecognitionCardProps = Readonly<{ className?: string }>;

export function NearMissRecognitionCard(props: NearMissRecognitionCardProps) {
  const { className = "" } = props;

  const now = new Date();
  const recognitionsQuery = useNearMissRecognitionsQuery({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });
  const allReporters = recognitionsQuery.data?.dataModel ?? [];

  // Most reports first. The endpoint's order is not guaranteed, and a leaderboard that is not
  // ranked is just a list of names.
  const reporters = [...allReporters].sort(
    (a, b) => b.nearMissCount - a.nearMissCount,
  );

  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(reporters.length / REPORTERS_PER_PAGE));
  // Clamped, not reset: the count changes on refetch and a stale page would render empty.
  const currentPage = Math.min(page, pageCount);
  const pageReporters = reporters.slice(
    (currentPage - 1) * REPORTERS_PER_PAGE,
    currentPage * REPORTERS_PER_PAGE,
  );

  return (
    <IncidentGlassCard className={className}>
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="h3" className="text3 text-ehs-darker">
            Recognition
          </Text>
          <Text as="p" className="text8 text-ehs-muted-text">
            Top reporters this month
          </Text>
        </div>
        <CardPager
          page={currentPage}
          pageCount={pageCount}
          onPageChange={setPage}
          label="reporters"
        />
      </header>

      <RecognitionBody
        reporters={pageReporters}
        isPending={recognitionsQuery.isPending}
        isError={recognitionsQuery.isError}
        error={recognitionsQuery.error}
      />
    </IncidentGlassCard>
  );
}
