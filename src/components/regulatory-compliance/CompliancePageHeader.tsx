"use client";

import { Text } from "@/components/Text";

export type CompliancePageHeaderProps = Readonly<{
  /** When false, hides the page title (e.g. add-obligation form). */
  showTitle?: boolean;
  className?: string;
}>;

export function CompliancePageHeader(props: CompliancePageHeaderProps) {
  const { showTitle = true, className = "" } = props;

  if (!showTitle) {
    return null;
  }

  return (
    <header
      className={[
        "flex min-h-[70px] flex-wrap items-center justify-between gap-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="h1"
        className="text-[26px] leading-none font-bold tracking-[-0.51px] text-[#0b1320]"
      >
        Regulatory Compliance
      </Text>
    </header>
  );
}
