"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { LOTO_ROUTE } from "@/app/dashboard/lockout-tagout/loto-procedure-data";
import type { LotoEquipmentDetail } from "@/app/dashboard/lockout-tagout/loto-equipment-detail-data";
import { useCapabilities } from "@/lib/capabilities";

const crumbMuted = "text4 font-normal text-ehs-placeholder";
const crumbLink =
  "text4 hover:text-ehs-gray font-normal text-ehs-muted-text transition-colors";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="text-ehs-placeholder size-2.75 shrink-0"
      aria-hidden="true"
    />
  );
}

export type LotoEquipmentDetailHeaderProps = Readonly<{
  detail: LotoEquipmentDetail;
  onEdit: () => void;
  onApplyLockout: () => void;
  /** When true, primary action is Remove Lockout instead of Apply. */
  isLockedOut?: boolean;
}>;

/**
 * Whether to draw the lockout action at all.
 *
 * Only an authorization block hides it: offering a control and then refusing
 * the click is a dead end, and the API is what actually enforces this — hiding
 * only removes the dead end.
 *
 * Every other block stays visible. "Already locked out" is the state that puts
 * Remove Lockout there in the first place, and an out-of-service machine or a
 * lapsed certification is a fact the operator needs to read, with something
 * they can do about it. Hiding those would leave a screen that silently omits
 * its own primary action.
 */
function showsLockoutAction(detail: LotoEquipmentDetail): boolean {
  return detail.cannotApplyKind !== "Unauthorized";
}

/** Breadcrumb + title + Edit / Apply/Remove Lockout — Figma 6888:50991. */
export function LotoEquipmentDetailHeader(
  props: LotoEquipmentDetailHeaderProps,
) {
  const { detail, onEdit, onApplyLockout, isLockedOut = false } = props;
  const showsAction = showsLockoutAction(detail);

  // Edit opens the procedure editor on an existing record, which is what
  // PUT /loto/equipment enforces — not Loto.Create, which governs adding one.
  // A worker is authorized to perform a procedure, not to rewrite it.
  const { can } = useCapabilities();
  const canEdit = can("Loto.Update");

  // Being on a machine's authorized list is not the same as holding the
  // permission to lock it: the Worker preset is granted Loto.View alone, so an
  // authorized worker was shown this button, filled in the form, and was
  // refused by the API at submit. The permission each endpoint enforces —
  // Loto.Apply for POST /loto/lockouts, Loto.Remove for its removal — is what
  // decides whether the control is drawn.
  const canLockAction = can(isLockedOut ? "Loto.Remove" : "Loto.Apply");
  const actionLabel = isLockedOut ? "Remove Lockout" : "Apply Lockout";
  const actionIcon = isLockedOut ? "mdi:lock-open-outline" : "mdi:lock-outline";

  return (
    <div className="backdrop-blur-2.5 bg-ehs-surface/62 border-ehs-border-ink/8 relative rounded-2xl border px-5.5 py-4 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:content-['']">
      <div className="relative z-1 flex flex-col gap-2">
        <nav
          aria-label="Breadcrumb"
          className="hidden items-center gap-1.5 overflow-x-auto md:flex"
        >
          <span className={crumbMuted}>Safety</span>
          <Chevron />
          <Link href={LOTO_ROUTE} className={crumbLink}>
            LOTO
          </Link>
          <Chevron />
          <span className={crumbMuted}>{detail.equipmentCode}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={LOTO_ROUTE}
              aria-label="Back to Lockout / Tagout"
              className="border-ehs-border text-ehs-dark-bg rounded-2.5 bg-ehs-surface hover:bg-ehs-surface-raised flex size-8 shrink-0 items-center justify-center border transition-colors md:hidden"
            >
              <Icon icon="mdi:chevron-left" className="size-3.5" />
            </Link>
            <div className="flex min-w-0 flex-col gap-1">
              <Text as="h1" className="text1 text-ehs-darker">
                {detail.name}
              </Text>
              <Text as="p" className="text4 text-ehs-muted-text">
                {detail.location}
              </Text>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            {canEdit ? (
              <Button
                type="button"
                variant="secondary"
                onClick={onEdit}
                className="text4 rounded-2.5 gap-2 px-4 py-2.5 font-medium"
              >
                <Icon icon="mdi:pencil-outline" className="size-3.5 shrink-0" />
                Edit
              </Button>
            ) : null}
            {showsAction && canLockAction ? (
              <Button
                type="button"
                variant={isLockedOut ? "primary" : "danger"}
                onClick={onApplyLockout}
                className={[
                  "text4 rounded-2.5 gap-2 px-4 py-2.5 font-semibold",
                  isLockedOut
                    ? "shadow-[0px_4px_7px_color-mix(in_oklab,var(--ehs-normal-blue)_40%,transparent)]"
                    : "shadow-[0px_4px_7px_color-mix(in_oklab,var(--ehs-red)_40%,transparent)]",
                ].join(" ")}
              >
                <Icon icon={actionIcon} className="size-3.5 shrink-0" />
                {actionLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
