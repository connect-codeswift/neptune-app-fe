"use client";

import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";

export type IhPageHeaderProps = Readonly<{
  breadcrumb: readonly string[];
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}>;

/** Page header used on IH sub-tabs — Figma Sampling Plans / Agents / etc. */
export function IhPageHeader(props: Readonly<IhPageHeaderProps>) {
  const { breadcrumb, title, subtitle, actions } = props;

  return (
    <IncidentGlassCard
      paddingClassName="px-5 py-4"
      className="min-w-0"
      incidentGlassCardClassName="gap-1.5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {breadcrumb.length > 0 ? (
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1.5"
            >
              {breadcrumb.map((label, index) => {
                const isLast = index === breadcrumb.length - 1;

                return (
                  <span
                    key={`${label}-${String(index)}`}
                    className="flex items-center gap-1.5"
                  >
                    {index > 0 ? (
                      <Icon
                        icon="mdi:chevron-right"
                        className="size-3 text-[#b3bbc8]"
                        aria-hidden
                      />
                    ) : null}
                    <Text
                      as="span"
                      className={[
                        "text-sm",
                        isLast ? "text-[#b3bbc8]" : "text-[#8892a3]",
                      ].join(" ")}
                    >
                      {label}
                    </Text>
                  </span>
                );
              })}
            </nav>
          ) : null}

          <Text
            as="h1"
            className="text-xl leading-8 font-bold tracking-tight text-[#0b1320]"
          >
            {title}
          </Text>

          {subtitle ? (
            <Text as="p" className="text-base text-[#8892a3]">
              {subtitle}
            </Text>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </IncidentGlassCard>
  );
}
