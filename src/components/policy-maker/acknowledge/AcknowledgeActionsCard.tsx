"use client";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";

export type AcknowledgeActionsCardProps = Readonly<{
  canApprove: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onApprove: () => void;
  className?: string;
}>;

const glassCardClass =
  "relative w-full min-w-0 overflow-hidden rounded-[16px] border-b-[0.727px] border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[16px] before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']";

/**
 * Audit notice + Cancel / I Approve (Figma 5568:25378).
 */
export function AcknowledgeActionsCard(
  props: Readonly<AcknowledgeActionsCardProps>,
) {
  const { canApprove, isSubmitting, onCancel, onApprove, className = "" } =
    props;

  return (
    <div className={[glassCardClass, className].filter(Boolean).join(" ")}>
      <div className="relative z-1 flex min-h-[199px] flex-col justify-between gap-6 px-[15px] py-[18px] sm:px-4 sm:py-5">
        <div className="flex max-w-[314px] flex-col gap-2">
          <Text
            as="h3"
            className="text-[16px] leading-7 font-semibold tracking-[-0.2px] whitespace-pre-wrap text-[#0b1320]"
          >
            Your Acknowledgement will be Recorded
          </Text>
          <Text as="p" className="text-[12px] leading-[18px] text-[#8892a3]">
            This section will be logged in the audit trail
          </Text>
        </div>

        <div className="flex flex-col-reverse items-stretch gap-1.5 sm:flex-row sm:items-center sm:justify-end sm:gap-1.5">
          <Button
            type="button"
            variant="tertiary"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-[38px] w-full rounded-[9.73px] border-[0.973px] border-[rgba(11,19,32,0.12)] bg-transparent px-[15px] text-[12px] font-bold text-[#566072] shadow-none hover:bg-white/60 sm:w-auto sm:min-w-[66px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onApprove}
            disabled={!canApprove || isSubmitting}
            className="h-[38px] w-full rounded-[9.73px] bg-[#0891a6] px-[14.6px] text-[12px] font-bold whitespace-nowrap shadow-[0px_5.838px_17.514px_-5.838px_#0891a6] hover:bg-[#078196] disabled:opacity-50 sm:w-auto"
          >
            {isSubmitting ? "Saving…" : "I Approve"}
          </Button>
        </div>
      </div>
    </div>
  );
}
