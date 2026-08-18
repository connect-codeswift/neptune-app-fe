"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  LOTO_REMOVE_SAFETY_RULES,
  toEnergySourceViews,
  type LotoRemoveLockoutContext,
} from "@/app/dashboard/lockout-tagout/loto-lockout-data";
import { LOTO_ROUTE } from "@/app/dashboard/lockout-tagout/loto-procedure-data";
import { getAuthDisplayName } from "@/lib/auth-context";
import { toast } from "@/lib/toast";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import {
  useLotoActiveLockoutsQuery,
  useLotoEquipmentDetailQuery,
} from "@/hooks/use-loto-queries";
import { useRemoveLotoLockoutMutation } from "@/hooks/use-loto-mutations";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  splitEnergySources,
  withEquipmentPrefix,
} from "@/services/mappers/loto.mapper";
import { LotoRemoveLockoutHeader } from "./LotoRemoveLockoutHeader";
import { LotoQueryStatus } from "../LotoQueryStatus";

function toNumericId(idParam: string): number | null {
  const trimmed = idParam.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export type LotoRemoveLockoutContentProps = Readonly<{
  lockoutId: string;
}>;

export function LotoRemoveLockoutContent(props: LotoRemoveLockoutContentProps) {
  const { lockoutId } = props;
  const hasToken = useHasAccessToken();
  const numericId = toNumericId(lockoutId);

  const activeLockoutsQuery = useLotoActiveLockoutsQuery(hasToken === true);
  const lockoutRow = useMemo(
    () =>
      numericId === null
        ? null
        : (activeLockoutsQuery.data?.find((row) => row.id === numericId) ??
          null),
    [activeLockoutsQuery.data, numericId],
  );

  const equipmentQuery = useLotoEquipmentDetailQuery(
    lockoutRow?.equipmentId ?? null,
    hasToken === true && lockoutRow !== null,
  );

  const context = useMemo<LotoRemoveLockoutContext | null>(() => {
    const detail = equipmentQuery.data;
    if (!lockoutRow || !detail) return null;

    return {
      lockoutId: lockoutRow.id,
      equipmentId: detail.id,
      equipmentName: detail.name,
      equipmentCode: withEquipmentPrefix(detail.equipmentCode),
      operatorName: lockoutRow.operator,
      lockNumber: lockoutRow.lockNumber,
      startedAt: lockoutRow.startedAt,
      purpose: lockoutRow.purpose,
      energySources: toEnergySourceViews(
        splitEnergySources(detail.energySources),
      ),
      signOffName: getAuthDisplayName(),
    };
  }, [lockoutRow, equipmentQuery.data]);

  if (numericId === null) {
    return <RemoveNotFound />;
  }

  const isLoading =
    hasToken === null ||
    (hasToken &&
      (activeLockoutsQuery.isLoading ||
        (lockoutRow !== null && equipmentQuery.isLoading)));

  if (isLoading) {
    return <LotoQueryStatus state="loading" />;
  }

  if (activeLockoutsQuery.isError || equipmentQuery.isError) {
    return (
      <LotoQueryStatus
        state="error"
        message={getMutationErrorMessage(
          activeLockoutsQuery.error ?? equipmentQuery.error,
          "Failed to load this lockout.",
        )}
      />
    );
  }

  if (!context) {
    return <RemoveNotFound />;
  }

  return <LotoRemoveLockoutForm context={context} />;
}

function RemoveNotFound() {
  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      <IncidentGlassCard paddingClassName="p-6" className="min-w-0">
        <Text as="p" className="text4 text-ehs-darker font-semibold">
          Active lockout not found
        </Text>
        <Link
          href={`${LOTO_ROUTE}?tab=active-lockouts`}
          className="text4 text-ehs-normal-blue mt-3 inline-block hover:underline"
        >
          Back to Active Lockouts
        </Link>
      </IncidentGlassCard>
    </div>
  );
}

function LotoRemoveLockoutForm(
  props: Readonly<{ context: LotoRemoveLockoutContext }>,
) {
  const { context } = props;
  const router = useRouter();
  const cancelHref = `${LOTO_ROUTE}?tab=active-lockouts`;
  const [energyRestored, setEnergyRestored] = useState(false);
  const [signedOff, setSignedOff] = useState(false);
  const removeMutation = useRemoveLotoLockoutMutation();

  const canConfirm =
    energyRestored && signedOff && !removeMutation.isPending;

  const handleConfirm = () => {
    if (!canConfirm) return;

    removeMutation.mutate(
      {
        id: context.lockoutId,
        payload: { energyRestoredConfirmed: true, signedOff: true },
      },
      {
        onSuccess: () => {
          toast.success(
            "Lockout removed",
            `${context.equipmentName} is back in service.`,
          );
          router.push(cancelHref);
        },
        onError: (error) => {
          toast.error(
            getMutationErrorMessage(error, "Failed to remove the lockout."),
          );
        },
      },
    );
  };

  const summaryFields = [
    { label: "Operator", value: context.operatorName },
    { label: "Lock Number", value: context.lockNumber },
    { label: "Started", value: context.startedAt },
    { label: "Purpose", value: context.purpose },
  ] as const;

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      <LotoRemoveLockoutHeader context={context} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <div className="relative rounded-5 bg-white px-4.5 pt-4.5 pb-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:rounded-5 before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
            <div className="relative z-1 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Icon
                  icon="mdi:lock-outline"
                  className="size-3.5 shrink-0 text-[#ef4444]"
                  aria-hidden="true"
                />
                <h2 className="text3 text-[#ef4444]">
                  Active Lockout Being Removed
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {summaryFields.map((field) => (
                  <div
                    key={field.label}
                    className="rounded-2.5 px-3 pt-2.5 pb-2.5"
                  >
                    <p className="text6 text-[#ef4444]">{field.label}</p>
                    <p className="text4 text-ehs-darker mt-0.75 font-semibold">
                      {field.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <IncidentGlassCard
            paddingClassName="p-5"
            className="min-w-0 rounded-5"
          >
            <h2 className="text3 text-ehs-darker">Energy Restoration</h2>
            <ul className="mt-3.5 flex flex-col gap-2">
              {context.energySources.map((source) => (
                <li
                  key={source.id}
                  className="flex items-center justify-between gap-2.5 rounded-2.5 border border-[rgba(11,19,32,0.14)] px-3.5 py-2.5"
                >
                  <span className="text4 text-ehs-darker font-semibold">
                    {source.label}
                  </span>
                  <span className="text4 font-semibold text-[#10b981]">
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
                className="size-4 shrink-0 rounded-0.5 border border-[#566072] accent-[#0891a6]"
              />
              <span className="text4 font-semibold text-[#2a3446]">
                Confirmed — all energy sources have been safely restored to
                operational state
              </span>
            </label>
          </IncidentGlassCard>

          <label className="relative flex cursor-pointer items-start gap-3 rounded-5 border border-[rgba(16,185,129,0.2)] bg-[#fafbfc] px-4.5 py-4.5 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:rounded-5 before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
            <input
              type="checkbox"
              checked={signedOff}
              onChange={(event) => setSignedOff(event.target.checked)}
              className="relative z-1 mt-0.5 size-4 shrink-0 rounded-0.5 border border-[#566072] accent-[#10b981]"
            />
            <span className="relative z-1 min-w-0">
              <span className="text5 block text-[#10b981]">
                Sign-Off Confirmation
              </span>
              <span className="text4 mt-0.75 block font-medium text-[#566072]">
                {`I, ${context.signOffName}, confirm that the work is complete, all personnel are clear, all lockout devices have been removed, and the equipment is safe to return to service.`}
              </span>
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={cancelHref}
              className="text4 text-ehs-gray inline-flex items-center gap-1.75 rounded-2.5 border border-[rgba(15,23,42,0.14)] bg-[rgba(255,255,255,0.62)] px-4 py-1.5 font-medium transition-colors hover:bg-white"
            >
              <Icon icon="mdi:arrow-left" className="size-3.5" />
              Cancel
            </Link>
            <Button
              type="button"
              variant="primary"
              disabled={!canConfirm}
              onClick={handleConfirm}
              className="text4 rounded-2.5 px-4 py-2.5 font-semibold shadow-[0px_6px_18px_rgba(8,145,166,0.45)] disabled:opacity-50"
            >
              {removeMutation.isPending
                ? "Removing…"
                : "Confirm Lockout Removed"}
            </Button>
          </div>
        </div>

        <div className="relative h-fit rounded-5 border border-[rgba(239,68,68,0.18)] bg-[rgba(255,255,255,0.5)] px-4.5 pt-4.5 pb-5 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:rounded-5 before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
          <div className="relative z-1">
            <h2 className="text3 text-[#ef4444]">Critical Safety Rules</h2>
            <ul className="mt-2.5 list-disc space-y-2 pl-4">
              {LOTO_REMOVE_SAFETY_RULES.map((rule) => (
                <li key={rule} className="text4 text-[#566072]">
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
