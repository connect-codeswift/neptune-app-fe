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
import { useSubmitLock } from "@/hooks/use-submit-lock";
import {
  splitEnergySources,
  withEquipmentPrefix,
} from "@/services/mappers/loto.mapper";
import { LotoRemoveLockoutHeader } from "./LotoRemoveLockoutHeader";
import { LotoQueryStatus } from "../LotoQueryStatus";

/* The confirmation card is pinned to #fafbfc - an off-white that is a shade
   below `--ehs-surface`, which sets it apart from the white cards above it. */

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
  // isPending alone re-enables the button the instant the server answers,
  // while the navigation away is still in flight — the same window that let a
  // second click file a duplicate on Apply. Held until this page is gone.
  const submitLock = useSubmitLock();

  const canConfirm = energyRestored && signedOff && !submitLock.isLocked;

  const handleConfirm = () => {
    if (!canConfirm) return;
    if (!submitLock.acquire()) return;

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
          submitLock.release();
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
          <div className="rounded-5 before:rounded-5 bg-ehs-surface relative px-4.5 pt-4.5 pb-4 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:content-['']">
            <div className="relative z-1 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Icon
                  icon="mdi:lock-outline"
                  className="text-ehs-red size-3.5 shrink-0"
                  aria-hidden="true"
                />
                <h2 className="text3 text-ehs-red">
                  Active Lockout Being Removed
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {summaryFields.map((field) => (
                  <div
                    key={field.label}
                    className="rounded-2.5 px-3 pt-2.5 pb-2.5"
                  >
                    <p className="text6 text-ehs-red">{field.label}</p>
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
            className="rounded-5 min-w-0"
          >
            <h2 className="text3 text-ehs-darker">Energy Restoration</h2>
            <ul className="mt-3.5 flex flex-col gap-2">
              {context.energySources.map((source) => (
                <li
                  key={source.id}
                  className="rounded-2.5 border-ehs-border-ink/14 flex items-center justify-between gap-2.5 border px-3.5 py-2.5"
                >
                  <span className="text4 text-ehs-darker font-semibold">
                    {source.label}
                  </span>
                  <span className="text4 text-ehs-green font-semibold">
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
                className="rounded-0.5 border-ehs-gray accent-ehs-normal-blue size-4 shrink-0 border"
              />
              <span className="text4 text-ehs-slate font-semibold">
                Confirmed — all energy sources have been safely restored to
                operational state
              </span>
            </label>
          </IncidentGlassCard>

          <label className="rounded-5 before:rounded-5 border-ehs-green/20 relative flex cursor-pointer items-start gap-3 border bg-[#fafbfc] px-4.5 py-4.5 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:content-['']">
            <input
              type="checkbox"
              checked={signedOff}
              onChange={(event) => setSignedOff(event.target.checked)}
              className="rounded-0.5 border-ehs-gray accent-ehs-green relative z-1 mt-0.5 size-4 shrink-0 border"
            />
            <span className="relative z-1 min-w-0">
              <span className="text5 text-ehs-green block">
                Sign-Off Confirmation
              </span>
              <span className="text4 text-ehs-gray mt-0.75 block font-medium">
                {`I, ${context.signOffName}, confirm that the work is complete, all personnel are clear, all lockout devices have been removed, and the equipment is safe to return to service.`}
              </span>
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={cancelHref}
              className="text4 text-ehs-gray rounded-2.5 hover:bg-ehs-surface border-ehs-border-ink/14 bg-ehs-surface/62 inline-flex items-center gap-1.75 border px-4 py-1.5 font-medium transition-colors"
            >
              <Icon icon="mdi:arrow-left" className="size-3.5" />
              Cancel
            </Link>
            <Button
              type="button"
              variant="primary"
              disabled={!canConfirm}
              onClick={handleConfirm}
              className="text4 rounded-2.5 px-4 py-2.5 font-semibold shadow-[0px_6px_18px_color-mix(in_oklab,var(--ehs-normal-blue)_45%,transparent)] disabled:opacity-50"
            >
              {submitLock.isLocked ? "Removing…" : "Confirm Lockout Removed"}
            </Button>
          </div>
        </div>

        <div className="rounded-5 before:rounded-5 border-ehs-red/18 bg-ehs-surface/50 relative h-fit border px-4.5 pt-4.5 pb-5 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:content-['']">
          <div className="relative z-1">
            <h2 className="text3 text-ehs-red">Critical Safety Rules</h2>
            <ul className="mt-2.5 list-disc space-y-2 pl-4">
              {LOTO_REMOVE_SAFETY_RULES.map((rule) => (
                <li key={rule} className="text4 text-ehs-gray">
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
