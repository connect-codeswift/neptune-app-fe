"use client";

import { Icon } from "@iconify/react";

export type IncidentDetailAiCardProps = Readonly<{
  insightText?: string;
  className?: string;
}>;

const DEFAULT_INSIGHT =
  "This is the third hose-related incident on Press #4 in 18 months. Consider preventive replacement schedule + supplier review.";

export function IncidentDetailAiCard(props: Readonly<IncidentDetailAiCardProps>) {
  const { insightText = DEFAULT_INSIGHT, className = "" } = props;
  const text = insightText.trim() || DEFAULT_INSIGHT;

  const highlight = "third hose-related incident";
  const highlightIndex = text.toLowerCase().indexOf(highlight);
  const before =
    highlightIndex >= 0 ? text.slice(0, highlightIndex) : text;
  const matched =
    highlightIndex >= 0
      ? text.slice(highlightIndex, highlightIndex + highlight.length)
      : "";
  const after =
    highlightIndex >= 0
      ? text.slice(highlightIndex + highlight.length)
      : "";

  return (
    <div
      className={[
        "flex flex-col gap-[7px] rounded-[20px] border border-ehs-normal-blue/30 bg-ehs-dark-blue-bg-light p-[19px] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_-12px_rgba(15,23,42,0.14)] backdrop-blur-[10px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center gap-1.5 text-ehs-dark-blue">
        <Icon icon="mdi:creation-outline" className="size-[13px]" aria-hidden="true" />
        <span className="text-xs font-bold tracking-[1px] uppercase">
          AI insight
        </span>
      </div>
      <p className="text-sm leading-[18.6px] text-ehs-slate">
        {matched ? (
          <>
            {before}
            <span className="font-bold">{matched}</span>
            {after}
          </>
        ) : (
          text
        )}
      </p>
    </div>
  );
}
