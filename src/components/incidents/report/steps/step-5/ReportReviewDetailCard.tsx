"use client";

import type { ReactNode } from "react";
import { Text } from "@/components/Text";

export type ReportReviewDetailRow = Readonly<{
  label: string;
  value: ReactNode;
}>;

export type ReportReviewDetailCardProps = Readonly<{
  title: string;
  rows: readonly ReportReviewDetailRow[];
  /** Defaults to Figma Where & when (`p-[15px]`). Reporter uses `pt-[15px] px-[15px] pb-[29px]`. */
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
  const { title, rows, paddingClassName = "p-[15px]", className = "" } = props;

  return (
    <div
      className={[
        "relative flex flex-col gap-[8px] rounded-[20px] border border-white/90 bg-[rgba(255,255,255,0.62)] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_-12px_rgba(15,23,42,0.14)] backdrop-blur-[10px]",
        paddingClassName,
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-[20px] before:shadow-[inset_0px_1px_0px_1px_rgba(255,255,255,0.9)] before:content-['']",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative z-[1] flex w-full flex-col items-start py-px">
        <Text
          as="p"
          className="text-ehs-muted-text w-full text-[10.5px] font-bold tracking-[1.05px] uppercase"
        >
          {title}
        </Text>
      </div>

      <div className="relative z-[1] flex w-full flex-col gap-[6px]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex w-full items-start justify-between gap-3"
          >
            <div className="shrink-0 py-px">
              <Text as="p" className="text-ehs-muted-text text-[12px]">
                {row.label}
              </Text>
            </div>
            <div className="min-w-0 py-px text-right">
              {typeof row.value === "string" ? (
                <Text
                  as="p"
                  className="text-ehs-dark-bg text-[12px] break-words"
                >
                  {row.value}
                </Text>
              ) : (
                <div className="text-ehs-dark-bg text-[12px] break-words">
                  {row.value}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
