"use client";

import { Icon } from "@iconify/react";
import { CardHeading } from "@/components/CardHeading";
import { ListItemRow } from "@/components/ComplianceDeadlinesCard";
import { ListCardSkeleton } from "@/components/DashboardSkeletons";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useMyActionsQuery } from "@/hooks/use-dashboard-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { mapMyActionsToItems } from "@/services/mappers/my-actions.mapper";

export type DashboardMyActionsCardProps = Readonly<{
  className?: string;
}>;

/** "My Actions" card. Loads GET /api/EHSCommandCenter/GetMyActions. */
export function DashboardMyActionsCard(
  props: Readonly<DashboardMyActionsCardProps>,
) {
  const { className = "" } = props;
  const accessTokenState = useHasAccessToken();
  const isClientReady = accessTokenState !== null;
  const hasToken = accessTokenState === true;

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
    <GlassCard className={className}>
      <CardHeading
        title="My Actions"
        subtitle={`${String(assignedCount)} assigned · ${String(dueThisWeekCount)} due this week`}
        viewAllHref="/dashboard/capa"
      />

      {showLoading ? (
        <ListCardSkeleton />
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
        <div className="mt-[7px] flex flex-col gap-[14px]">
          {items.map((item) => (
            <ListItemRow key={`${item.title}-${item.subtitle}`} {...item} />
          ))}
        </div>
      )}
    </GlassCard>
  );
}
