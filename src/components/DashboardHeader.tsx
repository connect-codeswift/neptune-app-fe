"use client";

import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { OrgSiteSwitcher } from "@/components/OrgSiteSwitcher";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";

export type DashboardHeaderProps = Readonly<{
  title?: string;
  /**
   * Sits immediately after the title, on the same baseline row — a status chip such as
   * "Beta" that qualifies the page name itself. Kept as a slot rather than a `badge: string`
   * so a caller owns its own styling, and so a page needing two chips is not blocked.
   */
  badge?: ReactNode;
  /** When true (default), loads org + sites from GET /api/v1/organizations/me. */
  showSiteSwitcher?: boolean;
  actionLabel?: string;
  className?: string;
  onActionClick?: () => void;
  onSiteChange?: (siteId: number | null) => void;
}>;

function ActionButton(
  props: Readonly<{ label: string; onClick?: () => void }>,
) {
  const { label, onClick } = props;

  return (
    <Button
      type="button"
      variant="primary"
      onClick={onClick}
      className="text4 shrink-0 rounded-xl px-4 py-2.5"
    >
      <Icon icon="mdi:plus" className="size-4" aria-hidden="true" />
      {label}
    </Button>
  );
}

export function DashboardHeader(props: Readonly<DashboardHeaderProps>) {
  const {
    title,
    badge,
    showSiteSwitcher = true,
    actionLabel,
    onActionClick,
    onSiteChange,
    className = "",
  } = props;

  const showRightControls = showSiteSwitcher || Boolean(actionLabel);

  return (
    <header
      className={[
        "flex w-full min-w-0 flex-row flex-wrap items-center justify-between gap-3 px-3 py-4 sm:px-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {title ? (
        // `flex-wrap` so a long title and its badge stack rather than pushing the
        // right-hand controls off a narrow screen.
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Text as="h1" className="text1 text-ehs-darker shrink-0">
            {title}
          </Text>
          {badge}
        </div>
      ) : null}

      {showRightControls ? (
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          {showSiteSwitcher ? (
            <OrgSiteSwitcher onSiteChange={onSiteChange} />
          ) : null}

          {actionLabel ? (
            <ActionButton label={actionLabel} onClick={onActionClick} />
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
