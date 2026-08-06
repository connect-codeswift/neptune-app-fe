"use client";

import { Icon } from "@iconify/react";
import {
  formatAccessWindowBannerMessage,
  type AccessWindowState,
} from "@/lib/access-window";

export type AccessWindowBannerProps = Readonly<{
  accessWindow: AccessWindowState;
  className?: string;
}>;

export function AccessWindowBanner(props: AccessWindowBannerProps) {
  const { accessWindow, className = "" } = props;
  const isFinalDay = accessWindow.daysRemaining <= 0;
  const message = formatAccessWindowBannerMessage(
    accessWindow.daysRemaining,
    accessWindow.accessExpiresAt,
  );

  return (
    <div
      role="status"
      className={[
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm",
        isFinalDay
          ? "border-ehs-red/25 bg-ehs-red/8 text-ehs-darker"
          : "border-amber-200/80 bg-amber-50/90 text-ehs-darker",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon
        icon={isFinalDay ? "mdi:alert-circle-outline" : "mdi:clock-outline"}
        className={[
          "mt-0.5 shrink-0 text-lg",
          isFinalDay ? "text-ehs-red" : "text-amber-600",
        ].join(" ")}
        aria-hidden="true"
      />
      <p className="min-w-0 leading-relaxed">{message}</p>
    </div>
  );
}
