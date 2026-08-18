"use client";

import type { ReactNode } from "react";
import { Text } from "@/components/Text";
import { ReportFieldError } from "@/components/incidents/report/shared/ReportFormField";

export type ReportReviewDetailRow = Readonly<{
  label: string;
  value: ReactNode;
}>;

export type ReportReviewDetailCardProps = Readonly<{
  title: string;
  rows: readonly ReportReviewDetailRow[];
  error?: string | null;
  /** Defaults to Figma Where & when (`p-3.75`). Reporter uses `pt-3.75 px-3.75 pb-7.25`. */
  paddingClassName?: string;
  className?: string;
}>;

/**
 * Pixel match for Figma EHSS-Web review detail cards
 * (`616:9073` Where & when, `616:9134` Reporter).
 */
export function ReportReviewDetailCard(
  props: Readonly<ReportReviewDetailCardProps>,
) {
  const {
    title,
    rows,
    error = null,
    paddingClassName = "p-3.75",
    className = "",
  } = props;

  return (
    <div
      className={[
        "rounded-5 backdrop-blur-2.5 relative flex flex-col gap-2 border border-white/90 bg-[rgba(255,255,255,0.62)] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_-12px_rgba(15,23,42,0.14)]",
        paddingClassName,
        error ? "border-ehs-red/40" : "",
        "before:rounded-5 before:pointer-events-none before:absolute before:inset-0 before:shadow-[inset_0px_1px_0px_1px_rgba(255,255,255,0.9)] before:content-['']",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-field-error={error ? "true" : undefined}
    >
      <div className="relative z-1 flex w-full flex-col items-start py-px">
        <Text
          as="p"
          className="text-ehs-muted-text w-full text-xs font-bold tracking-[1.05px] uppercase"
        >
          {title}
        </Text>
      </div>

      <div className="relative z-1 flex w-full flex-col gap-1.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex w-full items-start justify-between gap-3"
          >
            <div className="shrink-0 py-px">
              <Text as="p" className="text-ehs-muted-text text-sm">
                {row.label}
              </Text>
            </div>
            <div className="min-w-0 py-px text-right">
              {typeof row.value === "string" ? (
                <Text as="p" className="text-ehs-dark-bg text-sm break-words">
                  {row.value}
                </Text>
              ) : (
                <div className="text-ehs-dark-bg text-sm break-words">
                  {row.value}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {error ? <ReportFieldError>{error}</ReportFieldError> : null}
    </div>
  );
}
