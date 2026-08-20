"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  TABLE_HEADER_ACTION_ICON_CLASS,
  TABLE_HEADER_SECONDARY_ACTION_CLASS,
} from "@/components/ui/table-header-action";
import type { LotoActiveLockout } from "@/app/dashboard/lockout-tagout/loto-data";
import { lotoRemoveLockoutRoute } from "@/app/dashboard/lockout-tagout/loto-lockout-data";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useLotoActiveLockoutsQuery } from "@/hooks/use-loto-queries";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { LotoQueryStatus } from "./LotoQueryStatus";
import { LotoRegisterHeader } from "./LotoRegisterHeader";

const META_FIELDS = [
  {
    key: "operator",
    label: "Operator",
    icon: "mdi:account-outline",
    getValue: (item: LotoActiveLockout) => item.operator,
  },
  {
    key: "lockNumber",
    label: "Lock Number",
    icon: "mdi:lock-outline",
    getValue: (item: LotoActiveLockout) => item.lockNumber,
  },
  {
    key: "startedAt",
    label: "Started",
    icon: "mdi:clock-outline",
    getValue: (item: LotoActiveLockout) => item.startedAt,
  },
  {
    key: "expectedEndAt",
    label: "Expected End",
    icon: "mdi:calendar-check-outline",
    getValue: (item: LotoActiveLockout) => item.expectedEndAt,
  },
] as const;

/** Active lockout cards — GET /api/v1/loto/lockouts?status=active. */
export function LotoActiveLockoutsSection() {
  const router = useRouter();
  const hasToken = useHasAccessToken();
  const lockoutsQuery = useLotoActiveLockoutsQuery(hasToken === true);

  if (hasToken === null || (hasToken && lockoutsQuery.isLoading)) {
    return <LotoQueryStatus state="loading" />;
  }

  if (hasToken === false) {
    return (
      <LotoQueryStatus
        state="error"
        message="Please sign in to load active lockouts."
      />
    );
  }

  if (lockoutsQuery.isError) {
    return (
      <LotoQueryStatus
        state="error"
        message={getMutationErrorMessage(
          lockoutsQuery.error,
          "Failed to load active lockouts.",
        )}
      />
    );
  }

  const lockouts = lockoutsQuery.data ?? [];

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <LotoRegisterHeader
        title="Active lockouts"
        count={lockouts.length}
        itemNoun="lockout"
        itemNounPlural="lockouts"
      />

      {lockouts.length === 0 ? (
        <LotoQueryStatus
          state="empty"
          icon="mdi:lock-open-variant-outline"
          title="No active lockouts"
          message="No equipment is locked out at this site right now."
        />
      ) : (
        <div className="flex min-w-0 flex-col gap-3">
          {lockouts.map((item) => (
            <IncidentGlassCard
              key={item.id}
              paddingClassName="px-5 py-5"
              className="min-w-0"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Text as="h3" className="text3 text-ehs-darker">
                      {item.equipmentName}
                    </Text>
                    <IncidentBadge label="Locked Out" tone="danger" showDot />
                  </div>
                  <Text as="p" className="text8 text-ehs-muted-text mt-0.75">
                    {item.purpose}
                  </Text>
                </div>

                {item.canRemove ? (
                  <Button
                    type="button"
                    variant="tertiary"
                    onClick={() => {
                      router.push(lotoRemoveLockoutRoute(item.id));
                    }}
                    className={TABLE_HEADER_SECONDARY_ACTION_CLASS}
                  >
                    <Icon
                      icon="mdi:lock-open-outline"
                      className={TABLE_HEADER_ACTION_ICON_CLASS}
                      aria-hidden="true"
                    />
                    Remove Lockout
                  </Button>
                ) : null}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {META_FIELDS.map((field) => (
                  <div
                    key={field.key}
                    className="rounded-2.5 px-3 pt-2.5 pb-2.5"
                  >
                    <div className="flex items-center gap-1.25">
                      <Icon
                        icon={field.icon}
                        className="text-ehs-muted-text size-3.5"
                        aria-hidden="true"
                      />
                      <Text as="span" className="text9 text-ehs-muted-text">
                        {field.label}
                      </Text>
                    </div>
                    <Text as="p" className="text4 text-ehs-darker mt-1">
                      {field.getValue(item)}
                    </Text>
                  </div>
                ))}
              </div>
            </IncidentGlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
