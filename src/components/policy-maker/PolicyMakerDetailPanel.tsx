"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";

export type PolicyMakerDetailPanelProps = Readonly<{
  document: PolicyDocument | null;
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

function versionBadgeClass(badge: "review" | "archived" | "current"): string {
  if (badge === "review") {
    return "bg-[rgba(59,130,246,0.14)] text-[#3b82f6]";
  }
  if (badge === "current") {
    return "bg-[rgba(8,145,166,0.14)] text-[#056e7e]";
  }
  return "bg-[rgba(86,96,114,0.14)] text-[#566072]";
}

export function PolicyMakerDetailPanel(
  props: Readonly<PolicyMakerDetailPanelProps>,
) {
  const { document, className = "" } = props;

  if (!document) {
    return (
      <IncidentGlassCard
        className={["min-h-[240px] min-w-0", className]
          .filter(Boolean)
          .join(" ")}
        incidentGlassCardClassName="items-center justify-center"
      >
        <Text as="p" className="text4 text-ehs-muted-text">
          Select a document to view details.
        </Text>
      </IncidentGlassCard>
    );
  }

  const reviewProgress =
    document.reviewersTotal === 0
      ? 0
      : Math.round((document.reviewersDone / document.reviewersTotal) * 100);

  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className={["flex min-w-0 flex-col", className].filter(Boolean).join(" ")}
    >
      <div className="border-ehs-border border-b px-5 pt-[18px] pb-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <Text as="span" className="text7 text-ehs-muted-text">
            {document.code}
          </Text>

          <Link
            href={`/dashboard/policy-maker/${encodeURIComponent(document.id)}`}
            className="border-ehs-border text-ehs-normal-blue hover:bg-ehs-light-blue/40 text8 inline-flex shrink-0 items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 font-bold transition-colors"
          >
            Open details
            <Icon
              icon="mdi:arrow-right"
              className="size-3.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <Text as="h2" className="text3 text-ehs-darker">
          {document.title}
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text mt-2">
          {`${document.version} · ${document.status}`}
        </Text>
      </div>

      <div className="border-ehs-border grid grid-cols-2 gap-x-4 gap-y-4 border-b px-5 py-3.5">
        <MetaField label="Owner" value={document.ownerFullName} />
        <MetaField label="Site" value={document.site} />
        <MetaField label="Updated" value={document.updated} />
        <MetaField
          label="Reviewers"
          value={`${String(document.reviewersDone)} of ${String(document.reviewersTotal)} done`}
        />
      </div>

      <div className="border-ehs-border border-b px-5 py-3.5">
        <Text as="p" className="text9 text-ehs-muted-text mb-2">
          Review progress
        </Text>
        <div className="bg-ehs-muted-text/20 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-ehs-normal-blue h-full rounded-full"
            style={{ width: `${String(reviewProgress)}%` }}
          />
        </div>
      </div>

      <div className="px-5 py-3.5">
        <Text as="p" className="text9 text-ehs-muted-text mb-2">
          Version history
        </Text>
        <div className="flex flex-col">
          {document.versions.map((entry) => (
            <div
              key={`${entry.version}-${entry.date}`}
              className="border-ehs-border flex items-center gap-2.5 border-t py-2 first:border-t-0 first:pt-0"
            >
              <Text as="span" className="text7 text-ehs-darker w-7 shrink-0">
                {entry.version}
              </Text>
              <Text as="span" className="text8 text-ehs-gray min-w-0 flex-1">
                {`${entry.author} · ${entry.date}`}
              </Text>
              <span
                className={[
                  "text8 inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 font-bold tracking-[0.21px]",
                  versionBadgeClass(entry.badge),
                ].join(" ")}
              >
                {entry.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </IncidentGlassCard>
  );
}
