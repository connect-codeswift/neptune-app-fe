"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import type { LotoActiveLockout } from "@/app/dashboard/lockout-tagout/loto-data";
import { lotoRemoveLockoutRoute } from "@/app/dashboard/lockout-tagout/loto-lockout-data";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useLotoActiveLockoutsQuery } from "@/hooks/use-loto-queries";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { LotoQueryStatus } from "./LotoQueryStatus";

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

/** Active lockout cards — GET /api/Loto/active-lockouts. Figma 6888:48666. */
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

  if (lockouts.length === 0) {
    return (
      <LotoQueryStatus
        state="empty"
        message="No equipment is locked out at this site right now."
      />
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {lockouts.map((item) => (
        <article
          key={item.id}
          className="rounded-5 border border-[rgba(239,68,68,0.18)] bg-[rgba(255,255,255,0.62)] px-5 py-5 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text3 text-ehs-darker">{item.equipmentName}</h3>
              <p className="text4 text-ehs-muted-text mt-0.75">{item.purpose}</p>
            </div>

            {item.canRemove ? (
              <button
                type="button"
                onClick={() => {
                  router.push(lotoRemoveLockoutRoute(item.id));
                }}
                className="text4 text-ehs-gray inline-flex h-9.75 shrink-0 cursor-pointer items-center gap-2 rounded-2.5 border border-[rgba(15,23,42,0.14)] px-4 font-medium transition-colors"
              >
                <Icon icon="mdi:lock-open-outline" className="size-3.5" />
                Remove Lockout
              </button>
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
                    className="size-3.5 text-[#b3bbc8]"
                    aria-hidden="true"
                  />
                  <span className="text6 text-ehs-muted-text">{field.label}</span>
                </div>
                <p className="text4 text-ehs-darker mt-1">
                  {field.getValue(item)}
                </p>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
