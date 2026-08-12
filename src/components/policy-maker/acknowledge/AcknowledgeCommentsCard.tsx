"use client";

import { Text } from "@/components/Text";

export type AcknowledgeCommentsCardProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
  className?: string;
}>;

const glassCardClass =
  "relative w-full min-w-0 overflow-hidden rounded-4 border-b-[0.727px] border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:rounded-4 before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']";

/**
 * Optional comments textarea (Figma 5568:25373).
 */
export function AcknowledgeCommentsCard(
  props: Readonly<AcknowledgeCommentsCardProps>,
) {
  const { value, onChange, className = "" } = props;

  return (
    <div
      className={["flex w-full min-w-0 flex-col gap-4.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="h3"
        className="text-base leading-7 font-semibold tracking-[-0.2px] text-[#0b1320]"
      >
        Additional Comments (Optional)
      </Text>
      <div className={glassCardClass}>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Add any comments here ..."
          rows={8}
          className="relative z-1 min-h-49.75 w-full resize-y bg-transparent px-4 py-4.25 text-xs leading-4.5 text-[#0b1320] outline-none placeholder:text-[#8892a3] sm:px-4"
        />
      </div>
    </div>
  );
}
