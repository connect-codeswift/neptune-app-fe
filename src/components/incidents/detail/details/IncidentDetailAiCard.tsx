"use client";

import { Icon } from "@iconify/react";

export type IncidentDetailAiCardProps = Readonly<{
  insightText?: string;
  className?: string;
}>;

export function IncidentDetailAiCard(props: Readonly<IncidentDetailAiCardProps>) {
  const {
    insightText = "This is the third hose-related incident on Press #4 in 18 months. Consider preventive replacement schedule + supplier review.",
    className = "",
  } = props;

  return (
    <div
      className={[
        "from-ehs-light-blue to-ehs-light-blue-hover border-ehs-light-blue-active flex flex-col gap-2 rounded-[12px] border bg-gradient-to-r p-4 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="text-ehs-normal-blue flex items-center gap-1.5">
        <Icon icon="mdi:creation-outline" className="size-3.5" />
        <span className="text-[9.5px] font-bold tracking-[1px] uppercase">
          AI INSIGHT
        </span>
      </div>
      <p className="text-[11.5px] leading-relaxed text-[#2a3446]">
        {insightText}
      </p>
    </div>
  );
}
