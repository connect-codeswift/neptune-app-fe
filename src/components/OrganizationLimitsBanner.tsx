"use client";

import { Icon } from "@iconify/react";
import {
  formatOrganizationLimitsBannerMessage,
  type OrganizationLimitsState,
} from "@/lib/organization-limits";

/* The amber warning wash is pinned (`amber-200/80` on `amber-50/90`, icon at
   `--ehs-yellow-ink-soft` == amber-600) rather than folded into `--ehs-yellow`,
   which is the fill hue and washes the ink out. */

export type OrganizationLimitsBannerProps = Readonly<{
  limits: OrganizationLimitsState;
  className?: string;
}>;

export function OrganizationLimitsBanner(props: OrganizationLimitsBannerProps) {
  const { limits, className = "" } = props;
  const isAtLimit = limits.atSeatLimit;
  const message = formatOrganizationLimitsBannerMessage(limits);

  return (
    <div
      role="status"
      className={[
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm",
        isAtLimit
          ? "border-ehs-red/25 bg-ehs-red/8 text-ehs-darker"
          : "text-ehs-darker border-amber-200/80 bg-amber-50/90",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon
        icon={
          isAtLimit ? "mdi:account-alert-outline" : "mdi:account-group-outline"
        }
        className={[
          "mt-0.5 shrink-0 text-lg",
          isAtLimit ? "text-ehs-red" : "text-ehs-yellow-ink-soft",
        ].join(" ")}
        aria-hidden="true"
      />
      <p className="min-w-0 leading-relaxed">{message}</p>
    </div>
  );
}
