"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { ListItemRow } from "@/components/ComplianceDeadlinesCard";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useMyActionsQuery } from "@/hooks/use-dashboard-queries";
import { getAccessToken } from "@/lib/axios";
import { mapMyActionsToItems } from "@/services/mappers/my-actions.mapper";

export type DashboardMyActionsCardProps = Readonly<{
  className?: string;
}>;

/** "My Actions" card. Loads GET /api/EHSCommandCenter/GetMyActions. */
export function DashboardMyActionsCard(
  props: Readonly<DashboardMyActionsCardProps>,
) {
  const { className = "" } = props;
  const [isClientReady, setIsClientReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(getAccessToken()));
    setIsClientReady(true);
  }, []);

  const actionsQuery = useMyActionsQuery(isClientReady && hasToken);

  const dto = actionsQuery.data?.dataModel ?? null;
  const items = mapMyActionsToItems(dto?.actions);
  const assignedCount = dto?.assignedCount ?? 0;
  const dueThisWeekCount = dto?.dueThisWeekCount ?? 0;

  const showLoading = !isClientReady || (hasToken && actionsQuery.isLoading);
  const showSignInPrompt = isClientReady && !hasToken;
  const showError = isClientReady && hasToken && actionsQuery.isError;
  const showEmpty =
    isClientReady &&
    hasToken &&
    !actionsQuery.isLoading &&
    !actionsQuery.isError &&
    items.length === 0;

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
            My Actions
          </Text>
          <Text as="p" className="text-ehs-muted-text mt-0.5 text-xs">
            {`${String(assignedCount)} assigned · ${String(dueThisWeekCount)} due this week`}
          </Text>
        </div>

        <Link
          href="/dashboard/capa"
          className="text-ehs-gray hover:text-ehs-darker inline-flex items-center gap-0.5 text-xs font-medium transition-colors"
        >
          View all
          <Icon
            icon="mdi:chevron-right"
            className="text-sm"
            aria-hidden="true"
          />
        </Link>
      </div>

      {showLoading ? (
        <div className="flex min-h-[140px] flex-col items-center justify-center gap-2 text-center">
          <Icon
            icon="mdi:loading"
            className="text-ehs-normal-blue size-8 animate-spin"
            aria-hidden="true"
          />
          <Text as="p" className="text-ehs-muted-text text-sm">
            Loading actions…
          </Text>
        </div>
      ) : showSignInPrompt ? (
        <div className="flex min-h-[140px] items-center justify-center">
          <Text as="p" className="text-ehs-muted-text text-sm">
            Please sign in to load your actions.
          </Text>
        </div>
      ) : showError ? (
        <div className="flex min-h-[140px] flex-col items-center justify-center gap-2 text-center">
          <Icon
            icon="mdi:alert-circle-outline"
            className="text-ehs-red size-8"
            aria-hidden="true"
          />
          <Text as="p" className="text-ehs-darker text-sm font-semibold">
            Could not load your actions
          </Text>
          <Text as="p" className="text-ehs-muted-text text-sm">
            {getMutationErrorMessage(
              actionsQuery.error,
              "Failed to load your actions.",
            )}
          </Text>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void actionsQuery.refetch()}
            className="mt-1"
          >
            Retry
          </Button>
        </div>
      ) : showEmpty ? (
        <div className="flex min-h-[140px] items-center justify-center">
          <Text as="p" className="text-ehs-muted-text text-sm">
            No actions assigned to you right now.
          </Text>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <ListItemRow key={`${item.title}-${item.subtitle}`} {...item} />
          ))}
        </div>
      )}
    </article>
  );
}
