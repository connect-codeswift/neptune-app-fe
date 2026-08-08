"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents";
import {
  getLotoRemoveLockoutContext,
  LOTO_REMOVE_SAFETY_RULES,
  type LotoRemoveLockoutContext,
} from "@/app/dashboard/lockout-tagout/loto-lockout-data";
import { LOTO_ROUTE } from "@/app/dashboard/lockout-tagout/loto-procedure-data";
import { toast } from "@/lib/toast";
import { LotoRemoveLockoutHeader } from "./LotoRemoveLockoutHeader";

export type LotoRemoveLockoutContentProps = Readonly<{
  lockoutId: string;
}>;

export function LotoRemoveLockoutContent(props: LotoRemoveLockoutContentProps) {
  const { lockoutId } = props;
  const context = useMemo(
    () => getLotoRemoveLockoutContext(lockoutId),
    [lockoutId],
  );

  if (!context) {
    return (
      <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
        <IncidentGlassCard paddingClassName="p-6" className="min-w-0">
          <Text as="p" className="text-ehs-darker text-sm font-semibold">
            Active lockout not found
          </Text>
          <Link
            href={`${LOTO_ROUTE}?tab=active-lockouts`}
            className="text-ehs-normal-blue mt-3 inline-block text-sm hover:underline"
          >
            Back to Active Lockouts
          </Link>
        </IncidentGlassCard>
      </div>
    );
  }

  return <LotoRemoveLockoutForm context={context} />;
}

function LotoRemoveLockoutForm(props: { context: LotoRemoveLockoutContext }) {
  const { context } = props;
  const cancelHref = `${LOTO_ROUTE}?tab=active-lockouts`;
  const [energyRestored, setEnergyRestored] = useState(false);
  const [signedOff, setSignedOff] = useState(false);

  const canConfirm = energyRestored && signedOff;

  const handleConfirm = () => {
    if (!canConfirm) return;

    // Nothing is persisted: there is no LOTO service or mutation hook in the
    // codebase at all. Removing a lockout is the step that tells other workers
    // the equipment is live again, so imitating a request with a 350ms timer
    // and then toasting "Lockout removed" was the most dangerous version of
    // this to fake.
    toast.error(
      "Not available yet",
      "Removing a lockout isn't connected to the backend, so nothing was saved.",
    );
  };

  const summaryFields = [
    { label: "Operator", value: context.lockout.operator },
    { label: "Lock Number", value: context.lockout.lockNumber },
    { label: "Started", value: context.lockout.startedAt },
    { label: "Purpose", value: context.lockout.purpose },
  ] as const;

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      <LotoRemoveLockoutHeader context={context} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <div className="relative rounded-[20px] bg-white px-[18px] pt-[18px] pb-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[20px] before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
            <div className="relative z-1 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Icon
                  icon="mdi:lock-outline"
                  className="size-3.5 shrink-0 text-[#ef4444]"
                  aria-hidden="true"
                />
                <h2 className="text-[13px] leading-[19.5px] font-bold text-[#ef4444]">
                  Active Lockout Being Removed
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {summaryFields.map((field) => (
                  <div
                    key={field.label}
                    className="rounded-[10px] px-3 pt-2.5 pb-2.5"
                  >
                    <p className="text-[10px] font-semibold tracking-[0.6px] text-[#ef4444] uppercase">
                      {field.label}
                    </p>
                    <p className="text-ehs-darker mt-[3px] text-[13px] leading-[19.5px] font-semibold">
                      {field.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <IncidentGlassCard
            paddingClassName="p-5"
            className="min-w-0 rounded-[20px]"
          >
            <h2 className="text-ehs-darker text-sm leading-[21px] font-bold">
              Energy Restoration
            </h2>
            <ul className="mt-3.5 flex flex-col gap-2">
              {context.energySources.map((source) => (
                <li
                  key={source.id}
                  className="flex items-center justify-between gap-2.5 rounded-[10px] border border-[rgba(11,19,32,0.14)] px-3.5 py-2.5"
                >
                  <span className="text-ehs-darker text-[13px] leading-[19.5px] font-semibold">
                    {source.label}
                  </span>
                  <span className="text-[11px] leading-[16.5px] font-semibold text-[#10b981]">
                    Restoring
                  </span>
                </li>
              ))}
            </ul>
            <label className="mt-4 flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={energyRestored}
                onChange={(event) => setEnergyRestored(event.target.checked)}
                className="size-4 shrink-0 rounded-[2px] border border-[#566072] accent-[#0891a6]"
              />
              <span className="text-[13px] leading-[19.5px] font-semibold text-[#2a3446]">
                Confirmed — all energy sources have been safely restored to
                operational state
              </span>
            </label>
          </IncidentGlassCard>

          <label className="relative flex cursor-pointer items-start gap-3 rounded-[20px] border border-[rgba(16,185,129,0.2)] bg-[#fafbfc] px-[18px] py-[18px] shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[20px] before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
            <input
              type="checkbox"
              checked={signedOff}
              onChange={(event) => setSignedOff(event.target.checked)}
              className="relative z-1 mt-0.5 size-4 shrink-0 rounded-[2px] border border-[#566072] accent-[#10b981]"
            />
            <span className="relative z-1 min-w-0">
              <span className="block text-[13px] leading-[19.5px] font-bold text-[#10b981]">
                Sign-Off Confirmation
              </span>
              <span className="mt-[3px] block text-[12.5px] leading-[19.375px] font-medium text-[#566072]">
                {`I, ${context.signOffName}, confirm that the work is complete, all personnel are clear, all lockout devices have been removed, and the equipment is safe to return to service.`}
              </span>
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={cancelHref}
              className="inline-flex h-[38px] items-center gap-[7px] rounded-[10px] border border-[rgba(15,23,42,0.14)] bg-[rgba(255,255,255,0.62)] px-4 text-[13px] font-medium text-[#566072] transition-colors hover:bg-white"
            >
              <Icon icon="mdi:arrow-left" className="size-3.5" />
              Cancel
            </Link>
            <Button
              type="button"
              variant="primary"
              disabled={!canConfirm}
              onClick={handleConfirm}
              className="rounded-[10px] px-4 py-2.5 text-[13px] font-semibold shadow-[0px_6px_18px_rgba(8,145,166,0.45)] disabled:opacity-50"
            >
              Confirm Lockout Removed
            </Button>
          </div>
        </div>

        <div className="relative h-fit rounded-[20px] border border-[rgba(239,68,68,0.18)] bg-[rgba(255,255,255,0.5)] px-[18px] pt-[18px] pb-5 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[20px] before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
          <div className="relative z-1">
            <h2 className="text-[13px] leading-[19.5px] font-bold text-[#ef4444]">
              Critical Safety Rules
            </h2>
            <ul className="mt-2.5 list-disc space-y-2 pl-4">
              {LOTO_REMOVE_SAFETY_RULES.map((rule) => (
                <li
                  key={rule}
                  className="text-[12px] leading-[18px] text-[#566072]"
                >
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
