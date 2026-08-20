"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type HazcomDetailPanelMetaField = Readonly<{
  label: string;
  value: string;
}>;

export type HazcomDetailPanelProps = Readonly<{
  /** When null, shows the empty state. */
  item: Readonly<{
    id: string;
    title: string;
    subtitle?: string;
  }> | null;
  emptyMessage: string;
  /** Optional right-side control in the header (badge, custom node, …). */
  headerAside?: ReactNode;
  /** When set, renders the standard “Open details” link. */
  detailsHref?: string;
  metaFields?: readonly HazcomDetailPanelMetaField[];
  /** Extra section(s) under the meta grid (notes, materials, …). */
  children?: ReactNode;
  className?: string;
}>;

function MetaField(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Text as="p" className="text9 text-ehs-muted-text">
        {label}
      </Text>
      <Text as="p" className="text4 text-ehs-darker">
        {value}
      </Text>
    </div>
  );
}

/**
 * Shared side detail card for HazCom list pages. Domain pages pass field
 * content as props — do not fork a new panel file per tab.
 */
export function HazcomDetailPanel(props: Readonly<HazcomDetailPanelProps>) {
  const {
    item,
    emptyMessage,
    headerAside,
    detailsHref,
    metaFields = [],
    children,
    className = "",
  } = props;

  if (!item) {
    return (
      <IncidentGlassCard
        paddingClassName="p-4.5"
        className={["min-h-60 min-w-0", className].filter(Boolean).join(" ")}
        incidentGlassCardClassName="items-center justify-center"
      >
        <Text as="p" className="text4 text-ehs-muted-text">
          {emptyMessage}
        </Text>
      </IncidentGlassCard>
    );
  }

  const hasMeta = metaFields.length > 0;
  const hasFooter = Boolean(children);

  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className={["flex min-w-0 flex-col", className].filter(Boolean).join(" ")}
    >
      <div
        className={[
          "px-5 pt-4.5 pb-4",
          hasMeta || hasFooter ? "border-ehs-border border-b" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <Text as="span" className="text7 text-ehs-muted-text">
            {item.id}
          </Text>

          {headerAside ??
            (detailsHref ? (
              <Link
                href={detailsHref}
                className="border-ehs-border text-ehs-normal-blue hover:bg-ehs-light-blue/40 text5 bg-ehs-surface inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors"
              >
                Open details
                <Icon
                  icon="mdi:arrow-right"
                  className="size-3.5"
                  aria-hidden="true"
                />
              </Link>
            ) : null)}
        </div>

        <Text as="h2" className="text3 text-ehs-darker">
          {item.title}
        </Text>
        {item.subtitle ? (
          <Text as="p" className="text8 text-ehs-muted-text mt-2">
            {item.subtitle}
          </Text>
        ) : null}
      </div>

      {hasMeta ? (
        <div
          className={[
            "grid grid-cols-2 gap-x-4 gap-y-4 px-5 py-3.5",
            hasFooter ? "border-ehs-border border-b" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {metaFields.map((field) => (
            <MetaField
              key={field.label}
              label={field.label}
              value={field.value}
            />
          ))}
        </div>
      ) : null}

      {children}
    </IncidentGlassCard>
  );
}
