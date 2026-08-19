"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_ACTION_ICON_CLASS,
  TABLE_HEADER_SECONDARY_ACTION_CLASS,
} from "@/components/ui/table-header-action";

export type HazcomRegisterHeaderProps = Readonly<{
  title: string;
  count?: number;
  /** Singular noun for the count label, e.g. "chemical". Plural adds "s". */
  countNoun?: string;
  /** Override the whole count label (skips countNoun). */
  countLabel?: string;
  primaryHref: string;
  primaryLabel: string;
  primaryShortLabel?: string;
  primaryIcon?: string;
  secondaryAction?: Readonly<{
    label: string;
    icon?: string;
    disabled?: boolean;
    onClick: () => void;
  }>;
  className?: string;
  children?: ReactNode;
}>;

/**
 * Shared table-card register header for HazCom list pages — title, count, CTA.
 * Pass as the table `header` prop (chemicals, SDS, training, …).
 */
export function HazcomRegisterHeader(
  props: Readonly<HazcomRegisterHeaderProps>,
) {
  const {
    title,
    count,
    countNoun,
    countLabel,
    primaryHref,
    primaryLabel,
    primaryShortLabel,
    primaryIcon = "mdi:plus",
    secondaryAction,
    className = "",
    children,
  } = props;

  const resolvedCountLabel =
    countLabel ??
    (count != null && countNoun
      ? `${String(count)} ${count === 1 ? countNoun : `${countNoun}s`}`
      : count != null
        ? String(count)
        : null);

  return (
    <div
      className={["flex h-12.5 items-center justify-between gap-3", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex min-w-0 items-baseline gap-2">
        <Text as="h2" className="text3 text-ehs-darker shrink-0">
          {title}
        </Text>
        {resolvedCountLabel ? (
          <Text as="p" className="text8 text-ehs-muted-text truncate">
            {resolvedCountLabel}
          </Text>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        {children}
        {secondaryAction ? (
          <Button
            type="button"
            variant="tertiary"
            disabled={secondaryAction.disabled}
            onClick={secondaryAction.onClick}
            className={TABLE_HEADER_SECONDARY_ACTION_CLASS}
          >
            {secondaryAction.icon ? (
              <Icon
                icon={secondaryAction.icon}
                className={TABLE_HEADER_ACTION_ICON_CLASS}
                aria-hidden="true"
              />
            ) : null}
            {secondaryAction.label}
          </Button>
        ) : null}

        <Link href={primaryHref} className="shrink-0">
          <Button
            type="button"
            variant="primary"
            className={TABLE_HEADER_ACTION_CLASS}
          >
            <Icon
              icon={primaryIcon}
              className={TABLE_HEADER_ACTION_ICON_CLASS}
              aria-hidden="true"
            />
            {primaryShortLabel ? (
              <>
                <span className="sm:hidden">{primaryShortLabel}</span>
                <span className="hidden sm:inline">{primaryLabel}</span>
              </>
            ) : (
              primaryLabel
            )}
          </Button>
        </Link>
      </div>
    </div>
  );
}
