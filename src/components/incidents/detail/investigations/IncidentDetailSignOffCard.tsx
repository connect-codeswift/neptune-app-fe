"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { SignOffRow } from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type { SignOffRow };

export type IncidentDetailSignOffCardProps = Readonly<{
  signoffs?: readonly SignOffRow[];
  onRequestApproval?: () => void;
  className?: string;
}>;

export function IncidentDetailSignOffCard(
  props: Readonly<IncidentDetailSignOffCardProps>,
) {
  // No placeholder signatories: this card is the investigation's sign-off
  // record, and named people with a "Signed" badge are indistinguishable from
  // real approvals.
  const { signoffs = [], onRequestApproval, className = "" } = props;

  // No caller supplies onRequestApproval yet, and the previous fallback
  // toasted "notifications dispatched" without sending anything. Until there
  // is a handler, the control says it is unavailable rather than lying.
  const canRequestApproval = onRequestApproval != null;

  return (
    <IncidentGlassCard
      paddingClassName="p-4.5"
      incidentGlassCardClassName="gap-0"
      className={["bg-white/62", className].filter(Boolean).join(" ")}
    >
      <Text as="h3" className="text-ehs-dark-bg text3">
        Sign-off
      </Text>

      {signoffs.length === 0 ? (
        <Text as="p" className="text-ehs-muted-text text4 mt-4.5">
          No sign-offs recorded for this investigation.
        </Text>
      ) : (
        <div className="mt-4.5 flex flex-col">
          {signoffs.map((person, index) => (
            <div
              key={`${person.name}-${String(index)}`}
              className={[
                "flex items-center gap-2.5",
                index === 0
                  ? "pb-3"
                  : "border-t border-[rgba(15,23,42,0.08)] pt-3.25 pb-1",
              ].join(" ")}
            >
              <div
                className={[
                  "text8 rounded-2.5 flex size-8 shrink-0 items-center justify-center font-bold",
                  index === 0
                    ? "bg-ehs-dark-blue-bg-light text-ehs-dark-blue"
                    : "text-ehs-gray bg-[rgba(255,255,255,0.82)]",
                ].join(" ")}
              >
                {person.initials}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-ehs-dark-bg text4 leading-normal font-bold">
                  {person.name}
                </span>
                <span className="text-ehs-muted-text text4 truncate leading-normal">
                  {person.role.replace(/\s*-\s*/g, " · ")}
                </span>
              </div>
              <span
                className={[
                  "text-ehs-gray text7 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.25 py-0.75 leading-3.5",
                  person.badgeTone === "green"
                    ? "bg-ehs-dark-bg/14"
                    : "bg-ehs-dark-bg/16",
                ].join(" ")}
              >
                {person.badgeTone === "green" ? (
                  <Icon
                    icon="mdi:check"
                    className="size-2.5"
                    aria-hidden="true"
                  />
                ) : null}
                {person.badgeLabel}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onRequestApproval}
        disabled={!canRequestApproval}
        title={
          canRequestApproval
            ? undefined
            : "Approval requests are not available yet"
        }
        className="bg-ehs-normal-blue text-ehs-light-text hover:bg-ehs-normal-blue-active disabled:hover:bg-ehs-normal-blue rounded-2.5 text5 mt-4 inline-flex w-full items-center justify-center gap-2 px-3.75 py-2.5 shadow-[0px_6px_18px_-6px_var(--ehs-normal-blue)] transition-colors disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
      >
        <Icon icon="mdi:check" className="size-3.5" aria-hidden="true" />
        Request approval
      </button>

      {canRequestApproval ? null : (
        <Text as="p" className="text-ehs-muted-text text8 mt-1.5 text-center">
          Approval requests are not available yet.
        </Text>
      )}
    </IncidentGlassCard>
  );
}
