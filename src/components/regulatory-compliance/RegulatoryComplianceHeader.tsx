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
        "flex flex-col gap-4 px-[18px] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-2">
        <Text
          as="h1"
          className="text-ehs-darker text-2xl font-bold tracking-tight"
        >
          {title}
        </Text>
        {subtitle ? (
          <Text as="p" className="text-ehs-muted-text text-sm">
            {subtitle}
          </Text>
        ) : null}
      </div>

      <div className="flex items-start gap-2">
        <Button
          type="button"
          variant="tertiary"
          onClick={onSecondaryAction}
          className="text-ehs-gray rounded-[10px] border-white/90 bg-white/62 px-[14px] py-[8px] text-[13px] font-semibold shadow-sm backdrop-blur-[10px] hover:bg-white"
        >
          <Icon icon="mdi:tune" className="text-base" aria-hidden="true" />
          {secondaryActionLabel}
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={onPrimaryAction}
          className="rounded-[10px] bg-[#0891a6] px-[14px] py-[8px] text-[13px] font-semibold shadow-md shadow-[#0891a6]/40"
        >
          <Icon icon="mdi:plus" className="text-base" aria-hidden="true" />
          {primaryActionLabel}
        </Button>
      </div>
    </header>
  );
}
