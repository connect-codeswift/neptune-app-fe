"use client";

import { Icon } from "@iconify/react";

export type IncidentDetailAiCardProps = Readonly<{
  /**
   * A model-generated observation about this incident. There is no backend
   * that produces one yet, so in practice this is always absent and the card
   * renders nothing — see the note at the render site.
   */
  insightText?: string;
  className?: string;
}>;

/**
 * "AI insight" panel on the incident detail page.
 *
 * Renders nothing without an insight, and there is deliberately no fallback
 * copy. This card previously defaulted to a fixed sentence about hose failures
 * on Press #4, which every incident then displayed under an "AI INSIGHT" badge
 * regardless of what had actually happened — a fabricated finding on a record
 * that is kept for compliance. An empty panel is the honest state until
 * something real generates the text.
 */
export function IncidentDetailAiCard(props: Readonly<IncidentDetailAiCardProps>) {
  const { insightText, className = "" } = props;

  const text = insightText?.trim() ?? "";

  if (text === "") {
    return null;
  }

  return (
    <div
      className={[
        "flex flex-col gap-1.75 rounded-5 border border-ehs-normal-blue/30 bg-ehs-dark-blue-bg-light p-4.75 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_-12px_rgba(15,23,42,0.14)] backdrop-blur-2.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center gap-1.5 text-ehs-dark-blue">
        <Icon icon="mdi:creation-outline" className="size-3.25" aria-hidden="true" />
        <span className="text7 tracking-[1px] uppercase">
          AI insight
        </span>
      </div>
      <p className="text4 leading-[18.6px] text-ehs-slate">{text}</p>
    </div>
  );
}
