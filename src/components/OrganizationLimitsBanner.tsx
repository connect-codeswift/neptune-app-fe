"use client";

import { Icon } from "@iconify/react";
import {
  formatOrganizationLimitsBannerMessage,
  type OrganizationLimitsState,
} from "@/lib/organization-limits";

/* The amber warning wash is `--ehs-warning-surface` / `-border`, whose light
   values are exactly the `amber-50/90` on `amber-200/80` this used to hardcode.
   Not `--ehs-yellow`: that is the base fill hue and washes the ink out. The icon
   stays on `--ehs-yellow-ink-soft` == amber-600, a step lighter than the ink. */

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
          : "text-ehs-darker border-ehs-warning-border bg-ehs-warning-surface",
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
