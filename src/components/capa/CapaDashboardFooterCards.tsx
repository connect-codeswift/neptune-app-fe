"use client";

import Link from "next/link";
import { useMemo } from "react";

import { EmptyState } from "@/components/ui/EmptyState";

import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents";
import { Text } from "@/components/Text";
import { toast } from "@/lib/toast";
import type { CapaAwaitingReviewRow } from "@/components/capa/capa-dashboard-data";
import {
  useCapaAwaitingReviewQuery,
  useCapaWorkloadByOwnerQuery,
} from "@/hooks/use-capa-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useCapabilities } from "@/lib/capabilities";
import { capaStatusPillClass } from "@/lib/capa-filters";
import { canVerifyCapa, isCapaOwnedByCurrentUser } from "@/lib/current-user";
import { ehsButtonBaseClass, ehsButtonSecondaryClass } from "@/lib/ehs-classes";
import { mapCapaWorkloadByOwnerToView } from "@/services/mappers/capa-workload-by-owner.mapper";

const WORKLOAD_PREVIEW_LIMIT = 6;
const REVIEW_PREVIEW_LIMIT = 4;

function WorkloadListSkeleton() {
  return (
    <ul className="flex flex-col gap-4" aria-hidden>
      {Array.from({ length: 4 }, (_, index) => (
        <li key={`workload-skeleton-${String(index)}`}>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <div className="bg-ehs-border/40 h-4 w-28 animate-pulse rounded" />
            <div className="bg-ehs-border/30 h-4 w-6 animate-pulse rounded" />
          </div>
          <div className="bg-ehs-border/30 h-1.5 w-full animate-pulse rounded-full" />
        </li>
      ))}
    </ul>
  );
}

function ReviewListSkeleton() {
  return (
    <ul className="flex flex-col gap-2" aria-hidden>
      {Array.from({ length: 2 }, (_, index) => (
        <li
          key={`review-skeleton-${String(index)}`}
          className="border-ehs-border-ink/6 flex items-center gap-3 border-b py-3 last:border-b-0"
        >
          <div className="bg-ehs-border/30 size-10 shrink-0 animate-pulse rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="bg-ehs-border/40 h-4 w-3/5 animate-pulse rounded" />
            <div className="bg-ehs-border/30 h-3 w-2/5 animate-pulse rounded" />
          </div>
          <div className="bg-ehs-border/30 h-8 w-20 shrink-0 animate-pulse rounded-lg" />
        </li>
      ))}
    </ul>
  );
}

function capaVerifyHref(capaId: number): string {
  return `/dashboard/capa/${encodeURIComponent(String(capaId))}/verify`;
}

function capaDetailHref(capaId: number): string {
  return `/dashboard/capa/${encodeURIComponent(String(capaId))}`;
}

type ReviewActionProps = Readonly<{
  row: CapaAwaitingReviewRow;
  canVerify: boolean;
}>;

/**
 * The API takes a verification from `Completed` or `Pending Verification`, and
 * both land on the same form — so there is one action here, not two. It is
 * hidden for anyone the API would refuse: a non-leadership role, or the owner of
 * the action (a verifier must be someone else).
 */
function ReviewAction(props: ReviewActionProps) {
  const { row, canVerify } = props;

  if (!canVerify) {
    return null;
  }

  if (isCapaOwnedByCurrentUser(row.assignedId)) {
    return (
      <span
        className="text-ehs-muted-text shrink-0 text-xs font-semibold"
        title="A CAPA has to be verified by someone other than its owner."
      >
        Your action
      </span>
    );
  }

  return (
    <Link
      href={capaVerifyHref(row.capaId)}
      className={`${ehsButtonBaseClass} ${ehsButtonSecondaryClass} shrink-0 rounded-lg px-2.5 py-1.5 text-sm`}
    >
      Verify →
    </Link>
  );
}

type AwaitingReviewCardProps = Readonly<{
  hasToken: boolean | null;
}>;

/** Awaiting Effectiveness Review — CAPAs in `Completed` or `Pending Verification`. */
function CapaAwaitingReviewCard(props: AwaitingReviewCardProps) {
  const { hasToken } = props;
  const reviewQuery = useCapaAwaitingReviewQuery(hasToken === true);

  // Role lives in the access token, so it can only be read after mount —
  // keyed on hasToken so the first client render matches the server's.
  const canVerify = useMemo(
    () => (hasToken === true ? canVerifyCapa() : false),
    [hasToken],
  );

  const showSkeleton =
    hasToken === null ||
    (hasToken === true && reviewQuery.isPending && !reviewQuery.data);

  const rows = reviewQuery.data?.rows ?? [];
  const previewRows = rows.slice(0, REVIEW_PREVIEW_LIMIT);
  const totalAwaiting =
    (reviewQuery.data?.pendingVerificationCount ?? 0) +
    (reviewQuery.data?.completedCount ?? 0);

  const failed = reviewQuery.isError && !reviewQuery.data;
  const subtitle = failed
    ? "Unable to load the review queue"
    : "Completed and pending-verification actions";

  return (
    <IncidentGlassCard paddingClassName="p-5.25" className="min-w-0">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <Text
            as="h3"
            className="text-ehs-dark-bg text-lg font-bold tracking-[-0.14px]"
          >
            Awaiting Effectiveness Review
          </Text>
          <Text as="p" className="text-ehs-muted-text text-sm">
            {subtitle}
          </Text>
        </div>
        {showSkeleton || failed ? null : (
          <span className="bg-ehs-yellow/14 text-ehs-yellow-ink-soft inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold">
            {`${String(totalAwaiting)} awaiting`}
          </span>
        )}
      </div>

      <AwaitingReviewList
        showSkeleton={showSkeleton}
        rows={previewRows}
        canVerify={canVerify}
      />

      {!showSkeleton && !canVerify && previewRows.length > 0 ? (
        <Text as="p" className="text-ehs-muted-text mt-4 text-xs">
          Only an EHS Director, Lead or Manager can sign off an effectiveness
          review.
        </Text>
      ) : null}

      {rows.length > previewRows.length ? (
        <button
          type="button"
          className="text-ehs-muted-text hover:text-ehs-darker mt-4 inline-flex items-center gap-1 text-xs font-semibold"
          onClick={() => {
            toast.info("Full review queue coming soon");
          }}
        >
          {`${String(rows.length - previewRows.length)} more awaiting`}
          <Icon icon="mdi:chevron-right" className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </IncidentGlassCard>
  );
}

type AwaitingReviewListProps = Readonly<{
  showSkeleton: boolean;
  rows: readonly CapaAwaitingReviewRow[];
  canVerify: boolean;
}>;

function AwaitingReviewList(props: AwaitingReviewListProps) {
  const { showSkeleton, rows, canVerify } = props;

  if (showSkeleton) {
    return <ReviewListSkeleton />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        variant="plain"
        icon="mdi:clipboard-check-outline"
        title="Nothing awaiting review"
        message="Actions appear here once every task on them is complete."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => (
        <li
          key={row.capaId}
          className="border-ehs-border-ink/6 flex items-center gap-3 border-b py-3 last:border-b-0"
        >
          <span className="bg-ehs-yellow/14 text-ehs-yellow-ink-soft flex size-10 shrink-0 items-center justify-center rounded-full">
            <Icon icon="mdi:clipboard-check-outline" className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <Link
              href={capaDetailHref(row.capaId)}
              className="text-ehs-darker hover:text-ehs-normal-blue block truncate text-sm font-medium transition-colors"
            >
              {row.title}
            </Link>
            <p className="text-ehs-muted-text flex min-w-0 items-center gap-1.5 truncate text-xs">
              <span className="shrink-0">{row.code}</span>
              <span
                className={`${capaStatusPillClass(row.status)} shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold`}
              >
                {row.status}
              </span>
              <span className="truncate">{`${row.owner} · ${row.dueLabel}`}</span>
            </p>
          </div>
          <ReviewAction row={row} canVerify={canVerify} />
        </li>
      ))}
    </ul>
  );
}

/** Workload + awaiting effectiveness review — Figma 7123:42581. */
export function CapaDashboardFooterCards() {
  const hasToken = useHasAccessToken();

  // Both cards read endpoints requiring CAPA.Dashboard.View, which a Worker does not hold.
  // Rendered anyway they 403 and settle into their empty state, so a Worker was shown an
  // "Awaiting Effectiveness Review" queue reading 0 for work they cannot review at all.
  const { can, isReady } = useCapabilities();
  const isPermitted = !isReady || can("CAPA.Dashboard.View");

  const workloadQuery = useCapaWorkloadByOwnerQuery(
    hasToken === true && isPermitted,
  );

  const showWorkloadSkeleton =
    hasToken === null ||
    (hasToken === true && workloadQuery.isPending && !workloadQuery.data);

  const owners =
    workloadQuery.data?.owners ?? mapCapaWorkloadByOwnerToView(null).owners;
  const previewOwners = owners.slice(0, WORKLOAD_PREVIEW_LIMIT);
  const maxOpen = Math.max(...previewOwners.map((owner) => owner.openCount), 1);

  // After the hooks above, never before them.
  if (isReady && !isPermitted) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
      <IncidentGlassCard paddingClassName="p-5.25" className="min-w-0">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <Text
              as="h3"
              className="text-ehs-dark-bg text-lg font-bold tracking-[-0.14px]"
            >
              Workload by Owner
            </Text>
            <Text as="p" className="text-ehs-muted-text text-sm">
              {workloadQuery.isError && !workloadQuery.data
                ? "Unable to load active CAPAs"
                : "Active CAPAs"}
            </Text>
          </div>
          <button
            type="button"
            className="text-ehs-muted-text hover:text-ehs-darker inline-flex items-center gap-1 text-xs font-semibold"
            onClick={() => toast.info("Owner workload list coming soon")}
          >
            View all
            <Icon icon="mdi:chevron-right" className="size-3.5" aria-hidden />
          </button>
        </div>

        <WorkloadList
          showSkeleton={showWorkloadSkeleton}
          owners={previewOwners}
          maxOpen={maxOpen}
        />
      </IncidentGlassCard>

      <CapaAwaitingReviewCard hasToken={hasToken} />
    </div>
  );
}

type WorkloadListProps = Readonly<{
  showSkeleton: boolean;
  owners: readonly { name: string; openCount: number }[];
  maxOpen: number;
}>;

function WorkloadList(props: WorkloadListProps) {
  const { showSkeleton, owners, maxOpen } = props;

  if (showSkeleton) {
    return <WorkloadListSkeleton />;
  }

  if (owners.length === 0) {
    return (
      <EmptyState
        variant="plain"
        icon="mdi:account-check-outline"
        title="No open CAPAs assigned"
        message="Owners with open actions appear here."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {owners.map((owner) => (
        <li key={owner.name}>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-ehs-darker text-sm font-medium">
              {owner.name}
            </span>
            <span className="text-ehs-muted-text text-sm tabular-nums">
              {String(owner.openCount)}
            </span>
          </div>
          <div className="bg-ehs-surface-inverse/8 h-1.5 overflow-hidden rounded-full">
            <div
              className="bg-ehs-normal-blue h-full rounded-full"
              style={{
                width: `${String((owner.openCount / maxOpen) * 100)}%`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
