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
        className="text3 text-ehs-dark-bg"
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
              checked ? "text-ehs-normal-blue" : "text-ehs-muted-text",
            ].join(" ")}
            aria-hidden="true"
          />
        </span>
        <span className="text8 text-ehs-muted-text">
          I have read and understood this document. I agree to abide by the
          content and will follow the procedures as described{" "}
          <span className="text-ehs-dark-bg">*</span>
        </span>
      </label>
    </div>
  );
}
