"use client";

import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";

export type IhSearchToolbarProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "aria-label": string;
  resultLabel: string;
}>;

/** Glass search bar used under IH page headers — Figma 5305:30676. */
export function IhSearchToolbar(props: Readonly<IhSearchToolbarProps>) {
  const {
    value,
    onChange,
    placeholder = "Search agents…",
    "aria-label": ariaLabel,
    resultLabel,
  } = props;

  return (
    <IncidentGlassCard
      paddingClassName="px-4 py-3.5"
      className="min-w-0"
      incidentGlassCardClassName="gap-0"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-0 flex-1 sm:max-w-lg">
          <Icon
            icon="mdi:magnify"
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-ehs-muted-text"
            aria-hidden
          />
          <input
            type="search"
            value={value}
            onChange={(event) => {
              onChange(event.target.value);
            }}
            placeholder={placeholder}
            aria-label={ariaLabel}
            className="focus:border-ehs-normal-blue/40 h-9 w-full rounded-lg border border-ehs-border-ink/10 bg-ehs-surface/62 py-2 pr-3 pl-8 text-base text-ehs-dark-bg outline-none placeholder:text-ehs-muted-text"
          />
        </div>
        <Text as="span" className="shrink-0 text-sm text-ehs-muted-text">
          {resultLabel}
        </Text>
      </div>
    </IncidentGlassCard>
  );
}
