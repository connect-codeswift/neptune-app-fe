"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { IncidentClosureData } from "@/components/incidents/detail/incident-detail-types";

export type IncidentClosureStepReviewProps = Readonly<{
  data: IncidentClosureData;
  onChangeField: <K extends keyof IncidentClosureData>(
    field: K,
    value: IncidentClosureData[K],
  ) => void;
}>;

export function IncidentClosureStepReview(
  props: Readonly<IncidentClosureStepReviewProps>,
) {
  const { data, onChangeField } = props;

  const isConfirmed = data.isEhsConfirmed ?? false;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Text
          as="h2"
          className="text-ehs-dark-bg text5 leading-normal font-bold"
        >
          Digital Sign-off & Submission
        </Text>
        <Text as="p" className="text-ehs-gray text4 mt-2 leading-5 font-normal">
          Closing this incident creates a legal compliance record. Verification
          of security credentials and multi-factor authorization is requested to
          finalize digital signatures.
        </Text>
      </div>

      {/* Sign-off Green/Teal Box. Never substitutes a placeholder identity:
          the copy above calls this a legal compliance record, so an invented
          signer name, role or timestamp would be indistinguishable from a real
          signature. Missing values read as "Not recorded". */}
      <div className="rounded-3.5 border-ehs-normal-blue/40 bg-ehs-light-blue/40 border p-4 shadow-xs">
        <Text as="p" className="text-ehs-dark-bg text4 font-bold">
          {data.closedBy || "Not recorded"}
        </Text>
        <Text as="p" className="text-ehs-gray text4 mt-0.5 font-normal">
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
              : "border-ehs-border border bg-white",
          ].join(" ")}
        >
          {isConfirmed ? (
            <Icon icon="mdi:check" className="size-4 stroke-3" />
          ) : null}
        </div>
        <Text as="span" className="text-ehs-dark-bg text4 font-bold">
          I confirm all corrective actions are complete and verified per EHS
          guidelines.
        </Text>
      </button>
    </div>
  );
}
