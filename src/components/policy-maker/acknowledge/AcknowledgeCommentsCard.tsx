"use client";

import { Text } from "@/components/Text";

export type AcknowledgeCommentsCardProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
  className?: string;
}>;

const glassCardClass =
  "relative w-full min-w-0 overflow-hidden rounded-4 border-b border-ehs-border-ink/8 bg-ehs-surface/62 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-4 before:content-['']";

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
      <Text as="h3" className="text3 text-ehs-dark-bg">
        Additional Comments (Optional)
      </Text>
      <div className={glassCardClass}>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Add any comments here ..."
          rows={8}
          className="text4 text-ehs-dark-bg placeholder:text-ehs-muted-text relative z-1 min-h-49.75 w-full resize-y bg-transparent px-4 py-4.25 outline-none sm:px-4"
        />
      </div>
    </div>
  );
}
