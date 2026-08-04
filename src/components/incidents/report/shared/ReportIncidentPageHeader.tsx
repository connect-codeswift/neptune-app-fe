"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";

export type ReportIncidentPageHeaderProps = Readonly<{
  onSaveExit?: () => void;
  className?: string;
}>;

export function ReportIncidentPageHeader(
  props: Readonly<ReportIncidentPageHeaderProps>,
) {
  const { onSaveExit, className = "" } = props;

  return (
    <div
      className={[
        "relative flex min-h-[90px] flex-wrap items-center justify-between gap-4 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 px-3 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] sm:px-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative z-[1] flex min-w-0 flex-col gap-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1">
          <Link
            href="/dashboard/incidents/list"
            className="text-ehs-muted-text hover:text-ehs-gray text-sm font-medium transition-colors"
          >
            Incidents
          </Link>
          <Icon
            icon="mdi:chevron-right"
            className="text-ehs-muted-text size-[11px]"
            aria-hidden="true"
          />
          <Text as="span" className="text-ehs-gray text-sm font-medium">
            Report
          </Text>
        </nav>
        <Text
          as="h1"
          className="text-ehs-dark-bg text-2xl font-semibold tracking-[-0.2px]"
        >
          Report an incident
        </Text>
      </div>

      <Button
        type="button"
        variant="tertiary"
        onClick={onSaveExit}
        className="text-ehs-dark-bg relative z-[1] rounded-[10px] border-[rgba(11,19,32,0.14)] px-[15px] py-2.5 text-sm font-bold"
      >
        Save & exit
      </Button>
    </div>
  );
}
