"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { IncidentClosureData } from "@/components/incidents/detail/incident-detail-types";

export type IncidentClosureStepReviewProps = Readonly<{
  data: IncidentClosureData;
  onChangeField: <K extends keyof IncidentClosureData>(
    field: K,
    value: IncidentClosureData[K]
  ) => void;
}>;

export function IncidentClosureStepReview(
  props: Readonly<IncidentClosureStepReviewProps>
) {
  const { data, onChangeField } = props;

  const isConfirmed = data.isEhsConfirmed ?? true;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Text
          as="h2"
          className="text-[18px] leading-tight font-bold tracking-tight text-[#0f172a]"
        >
          Digital Sign-off & Submission
        </Text>
        <Text as="p" className="mt-2 text-[13px] font-medium leading-[20px] text-[#64748b]">
          Closing this incident creates a legal compliance record. Verification of security credentials and multi-factor authorization is requested to finalize digital signatures.
        </Text>
      </div>

      {/* Sign-off Green/Teal Box */}
      <div className="rounded-[14px] border border-[#008ba3]/40 bg-[#d2eff4]/40 p-4 shadow-xs">
        <Text as="p" className="text-[13px] font-bold text-[#0f172a]">
          {data.closedBy || "Sarah Mitchell"}
        </Text>
        <Text as="p" className="mt-0.5 text-[12px] font-medium text-[#64748b]">
          {`${data.closedByRole || "EHS Manager"} · ${data.closureDate || "24 Apr 2026, 15:04"}`}
        </Text>
      </div>

      {/* Confirmation Checkbox */}
      <button
        type="button"
        onClick={() => onChangeField("isEhsConfirmed", !isConfirmed)}
        className="flex items-center gap-3 text-left focus:outline-none"
      >
        <div
          className={[
            "flex size-5 shrink-0 items-center justify-center rounded transition-colors",
            isConfirmed
              ? "bg-[#008ba3] text-white"
              : "border border-[#cbd5e1] bg-white",
          ].join(" ")}
        >
          {isConfirmed ? (
            <Icon icon="mdi:check" className="size-4 stroke-[3]" />
          ) : null}
        </div>
        <Text as="span" className="text-[13px] font-bold text-[#0f172a]">
          I confirm all corrective actions are complete and verified per EHS guidelines.
        </Text>
      </button>
    </div>
  );
}
