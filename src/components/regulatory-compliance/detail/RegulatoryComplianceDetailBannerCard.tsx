"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IncidentBadge } from "@/components/incidents/list/IncidentBadge";
import { Text } from "@/components/Text";
import type { ComplianceObligationDetail } from "../regulatory-compliance-types";

export type RegulatoryComplianceDetailBannerCardProps = Readonly<{
  detail: ComplianceObligationDetail;
  onMarkAsComplete?: () => void;
  onDelete?: () => void;
  isMarkingComplete?: boolean;
  isDeleting?: boolean;
  className?: string;
}>;

export function RegulatoryComplianceDetailBannerCard(
  props: RegulatoryComplianceDetailBannerCardProps,
) {
  const {
    detail,
    onMarkAsComplete,
    onDelete,
    isMarkingComplete = false,
    isDeleting = false,
    className = "",
  } = props;

  const isCompliant = detail.status === "Compliant";

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className={["bg-[rgba(255,255,255,0.62)] backdrop-blur-[10px]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="text-ehs-gray flex items-center gap-1.5 text-[13px] font-light"
          >
            <Link
              href="/dashboard/regulatory-compliance"
              className="hover:text-ehs-dark-bg hover:underline"
            >
              Compliance
            </Link>
            <Icon
              icon="mdi:chevron-right"
              className="size-3 shrink-0"
              aria-hidden="true"
            />
            <Text as="span" className="text-ehs-gray font-semibold">
              {detail.code}
            </Text>
          </nav>

          {/* Title + Status Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <Text
              as="h1"
              className="text-ehs-dark-bg text-[22px] leading-tight font-bold"
            >
              {detail.title}
            </Text>

            <IncidentBadge
              label={detail.status}
              tone={isCompliant ? "success" : "muted"}
              showDot
            />
          </div>

          {/* Subtitle */}
          <Text as="p" className="text-ehs-muted-text text-[13px] font-light">
            {detail.subtitle}
          </Text>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting || isMarkingComplete}
              className={[
                "inline-flex items-center justify-center gap-1.5 rounded-xl border border-ehs-border bg-white/70 px-4 py-2.5 text-[14px] font-normal text-ehs-gray transition-all hover:bg-white",
                isDeleting || isMarkingComplete
                  ? "cursor-not-allowed opacity-70"
                  : "",
              ].join(" ")}
            >
              <Icon
                icon={isDeleting ? "mdi:loading" : "mdi:trash-can-outline"}
                className={["size-4", isDeleting ? "animate-spin" : ""]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden="true"
              />
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          ) : null}

          <button
            type="button"
            onClick={onMarkAsComplete}
            disabled={isMarkingComplete || isDeleting}
            className={[
              "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-[14px] font-normal shadow-xs transition-all",
              "text-ehs-light-text",
              isCompliant
                ? "bg-ehs-gray hover:bg-ehs-gray/90 active:bg-ehs-gray/80"
                : "bg-ehs-green hover:bg-ehs-green/90 active:bg-ehs-green/80",
              isMarkingComplete || isDeleting ? "cursor-not-allowed opacity-70" : "",
            ].join(" ")}
          >
            {isMarkingComplete
              ? "Saving…"
              : isCompliant
                ? "Completed"
                : "Mark as Complete"}
          </button>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
