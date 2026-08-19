"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";

export type RegulatoryComplianceHeaderProps = Readonly<{
  title: string;
  subtitle?: string;
  secondaryActionLabel?: string;
  primaryActionLabel?: string;
  onSecondaryAction?: () => void;
  onPrimaryAction?: () => void;
  className?: string;
}>;

/**
 * Regulatory Compliance page header.
 *
 * Mirrors Figma `compliance-skeleton` header (4818:19254):
 * title + subtitle on the left, secondary + primary actions on the right.
 */
export function RegulatoryComplianceHeader(
  props: RegulatoryComplianceHeaderProps,
) {
  const {
    title,
    subtitle,
    secondaryActionLabel = "Filter",
    primaryActionLabel = "Add Requirement",
    onSecondaryAction,
    onPrimaryAction,
    className = "",
  } = props;

  return (
    <header
      className={[
        "flex flex-col gap-4 px-4.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-2">
        <Text as="h1" className="text1 text-ehs-darker">
          {title}
        </Text>
        {subtitle ? (
          <Text as="p" className="text8 text-ehs-muted-text">
            {subtitle}
          </Text>
        ) : null}
      </div>

      <div className="flex items-start gap-2">
        <Button
          type="button"
          variant="tertiary"
          onClick={onSecondaryAction}
          className="text4 text-ehs-gray rounded-2.5 backdrop-blur-2.5 border-ehs-hairline/90 bg-ehs-surface/62 px-3.5 py-2 shadow-sm hover:bg-ehs-surface"
        >
          <Icon icon="mdi:tune" className="size-4" aria-hidden="true" />
          {secondaryActionLabel}
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={onPrimaryAction}
          className="text4 rounded-2.5 bg-ehs-normal-blue px-3.5 py-2 shadow-md shadow-ehs-normal-blue/40"
        >
          <Icon icon="mdi:plus" className="size-4" aria-hidden="true" />
          {primaryActionLabel}
        </Button>
      </div>
    </header>
  );
}
