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

  const isConfirmed = data.isEhsConfirmed ?? false;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Text
          as="h2"
          className="text-[15px] leading-normal font-bold text-ehs-dark-bg"
        >
          Digital Sign-off & Submission
        </Text>
        <Text as="p" className="mt-2 text-[13px] font-normal leading-[20px] text-ehs-gray">
          Closing this incident creates a legal compliance record. Verification of security credentials and multi-factor authorization is requested to finalize digital signatures.
        </Text>
      </div>

      {/* Sign-off Green/Teal Box. Never substitutes a placeholder identity:
          the copy above calls this a legal compliance record, so an invented
          signer name, role or timestamp would be indistinguishable from a real
          signature. Missing values read as "Not recorded". */}
      <div className="rounded-[14px] border border-ehs-normal-blue/40 bg-ehs-light-blue/40 p-4 shadow-xs">
        <Text as="p" className="text-[13px] font-bold text-ehs-dark-bg">
          {data.closedBy || "Not recorded"}
        </Text>
        <Text as="p" className="mt-0.5 text-[13px] font-normal text-ehs-gray">
          {[data.closedByRole, data.closureDate].filter(Boolean).join(" · ") ||
            "Role and date not recorded"}
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
              ? "bg-ehs-normal-blue text-ehs-light-text"
              : "border border-ehs-border bg-white",
          ].join(" ")}
        >
          {isConfirmed ? (
            <Icon icon="mdi:check" className="size-4 stroke-[3]" />
          ) : null}
        </div>
        <Text as="span" className="text-[13px] font-bold text-ehs-dark-bg">
          I confirm all corrective actions are complete and verified per EHS guidelines.
        </Text>
      </button>
    </div>
  );
}
