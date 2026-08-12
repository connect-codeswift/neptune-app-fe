"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

export type AcknowledgeConfirmSectionProps = Readonly<{
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}>;

/**
 * Required confirmation checkbox (Figma 5568:25364).
 */
export function AcknowledgeConfirmSection(
  props: Readonly<AcknowledgeConfirmSectionProps>,
) {
  const { checked, onCheckedChange, className = "" } = props;

  return (
    <div
      className={["flex w-full min-w-0 flex-col gap-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="h3"
        className="text-base leading-7 font-semibold tracking-[-0.2px] text-[#0b1320]"
      >
        Please Confirm
      </Text>
      <label className="flex max-w-87.5 cursor-pointer items-start gap-2">
        <span className="inline-flex size-6 shrink-0 items-center justify-center">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheckedChange(event.target.checked)}
            className="sr-only"
          />
          <Icon
            icon={
              checked ? "mdi:checkbox-marked" : "mdi:checkbox-blank-outline"
            }
            className={[
              "size-6",
              checked ? "text-[#0891a6]" : "text-[#8892a3]",
            ].join(" ")}
            aria-hidden="true"
          />
        </span>
        <span className="text-xs leading-4.5 text-[#8892a3]">
          I have read and understood this document. I agree to abide by the
          content and will follow the procedures as described{" "}
          <span className="text-[#0b1320]">*</span>
        </span>
      </label>
    </div>
  );
}
