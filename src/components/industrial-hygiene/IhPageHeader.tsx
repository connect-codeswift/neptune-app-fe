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
                        className="text-ehs-placeholder size-3"
                        aria-hidden
                      />
                    ) : null}
                    <Text
                      as="span"
                      className={[
                        "text-sm",
                        isLast ? "text-ehs-placeholder" : "text-ehs-muted-text",
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
            className="text-ehs-dark-bg text-xl leading-8 font-bold tracking-tight"
          >
            {title}
          </Text>

          {subtitle ? (
            <Text as="p" className="text-ehs-muted-text text-base">
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
