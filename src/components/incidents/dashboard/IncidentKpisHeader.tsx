"use client";

import { Text } from "@/components/Text";

export type IncidentKpisHeaderProps = Readonly<{
  title?: string;
  siteLabel?: string;
  onSiteClick?: () => void;
  onExportClick?: () => void;
  className?: string;
}>;

export function IncidentKpisHeader(props: Readonly<IncidentKpisHeaderProps>) {
  const { title = "Incident KPIs", className = "" } = props;

  return (
    <header
      className={[
        "flex flex-wrap items-center justify-between gap-4 px-4 py-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="h1"
        className="text-ehs-darker text-2xl font-bold tracking-tight"
      >
        {title}
      </Text>

      <div className="flex flex-wrap items-center gap-2">
        {/* Site switcher + export — see future/global-header-utilities.md */}
      </div>
    </header>
  );
}
