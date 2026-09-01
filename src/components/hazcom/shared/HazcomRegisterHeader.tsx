"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { useCapabilities } from "@/lib/capabilities";
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
  /** Omit both to render no primary CTA — a register a reader may not add to. */
  primaryHref?: string;
  primaryLabel?: string;
  primaryShortLabel?: string;
  primaryIcon?: string;
  /**
   * Capability the primary CTA requires, e.g. `HazCom.Create`. Undefined leaves
   * it ungated; the endpoint behind it enforces the real rule either way.
   */
  primaryCapability?: string;
  secondaryAction?: Readonly<{
    label: string;
    icon?: string;
    disabled?: boolean;
    onClick: () => void;
  }>;
  /** Capability the secondary action requires. Undefined leaves it ungated. */
  secondaryCapability?: string;
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
    primaryCapability,
    secondaryAction,
    secondaryCapability,
    className = "",
    children,
  } = props;

  // A control named after the capability its own endpoint enforces, so what an
  // admin ticks in Roles & Rights is what the user sees. No capability means
  // ungated — the callers that pass none are registers everyone who can reach
  // the page may write to.
  //
  // `isReady` gates rather than defaults-open: drawing a button and pulling it
  // away once the session lands is worse than drawing it a beat late.
  const { can, isReady } = useCapabilities();
  const allow = (capability: string | undefined) =>
    capability === undefined || (isReady && can(capability));

  const showPrimary =
    primaryHref !== undefined &&
    primaryLabel !== undefined &&
    allow(primaryCapability);

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
        {secondaryAction && allow(secondaryCapability) ? (
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

        {showPrimary ? (
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
        ) : null}
      </div>
    </div>
  );
}
