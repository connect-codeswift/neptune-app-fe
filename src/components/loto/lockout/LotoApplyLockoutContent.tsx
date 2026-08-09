"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import {
  FormBuilder,
  type FormValues,
} from "@/components/form-builder";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  getLotoApplyLockoutContext,
  type LotoApplyLockoutContext,
} from "@/app/dashboard/lockout-tagout/loto-lockout-data";
import { LOTO_ROUTE } from "@/app/dashboard/lockout-tagout/loto-procedure-data";
import { lotoEquipmentDetailRoute } from "@/app/dashboard/lockout-tagout/loto-equipment-detail-data";
import { toast } from "@/lib/toast";
import {
  LOTO_APPLY_FORM_ID,
  buildApplyLockoutSchema,
  fieldString,
  toApplyLockoutFormValues,
} from "./apply-lockout-schema";
import { LotoApplyLockoutHeader } from "./LotoApplyLockoutHeader";
import { LotoEnergySourcesPanel } from "./LotoEnergySourcesPanel";

const fieldClass = [
  "gap-3.5",
  "[&_label]:text-[12px]",
  "[&_label]:font-semibold",
  "[&_label]:text-[#566072]",
  "[&_input]:h-[42px]",
  "[&_input]:rounded-[10px]",
  "[&_input]:bg-[rgba(255,255,255,0.62)]",
  "[&_input]:text-[13.5px]",
].join(" ");

export type LotoApplyLockoutContentProps = Readonly<{
  equipmentId: string;
}>;

export function LotoApplyLockoutContent(props: LotoApplyLockoutContentProps) {
  const { equipmentId } = props;
  const context = useMemo(
    () => getLotoApplyLockoutContext(equipmentId),
    [equipmentId],
  );

  if (!context) {
    return (
      <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
        <IncidentGlassCard paddingClassName="p-6" className="min-w-0">
          <Text as="p" className="text-ehs-darker text-sm font-semibold">
            Equipment not found
          </Text>
          <Link
            href={LOTO_ROUTE}
            className="text-ehs-normal-blue mt-3 inline-block text-sm hover:underline"
          >
            Back to LOTO
          </Link>
        </IncidentGlassCard>
      </div>
    );
  }

  return <LotoApplyLockoutForm context={context} />;
}

function LotoApplyLockoutForm(props: { context: LotoApplyLockoutContext }) {
  const { context } = props;
  const detailHref = lotoEquipmentDetailRoute(context.equipment.id);
  const schema = useMemo(() => buildApplyLockoutSchema(), []);
  const [confirmed, setConfirmed] = useState(false);

  const handleValid = (values: FormValues) => {
    if (!confirmed) {
      toast.error("Confirm you have followed the LOTO procedure");
      return;
    }

    const lockNumber = fieldString(values, "lockNumber").trim();
    const purpose = fieldString(values, "purpose").trim();
    if (!lockNumber || !purpose) {
      toast.error("Lock number and purpose are required");
      return;
    }

    // Nothing is persisted: there is no LOTO service or mutation hook in the
    // codebase at all. This previously waited 350ms to imitate a request, then
    // toasted "Lockout applied" and navigated to the active-lockouts tab — so
    // a lockout that was never recorded looked registered. Say so instead.
    toast.error(
      "Not available yet",
      "Applying a lockout isn't connected to the backend, so nothing was saved.",
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      <LotoApplyLockoutHeader context={context} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <IncidentGlassCard
            paddingClassName="p-[22px]"
            className="min-w-0 rounded-[20px]"
          >
            <h2 className="text-ehs-darker text-sm leading-[21px] font-bold">
              Lockout Registration
            </h2>
            <div className="mt-[18px]">
              <FormBuilder
                formId={LOTO_APPLY_FORM_ID}
                schema={schema}
                initialValues={toApplyLockoutFormValues(context.operatorName)}
                hideActions
                className={fieldClass}
                onSubmit={handleValid}
              />
            </div>
          </IncidentGlassCard>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[rgba(239,68,68,0.16)] bg-[rgba(239,68,68,0.04)] px-[18px] py-4">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded-[2px] border border-[#767676] accent-[#ef4444]"
            />
            <span className="min-w-0">
              <span className="block text-[13px] leading-[19.5px] font-bold text-[#ef4444]">
                Final Confirmation
              </span>
              <span className="mt-1 block text-[12.5px] leading-[19.375px] font-medium text-[#566072]">
                {`I have read, understood, and followed procedure `}
                <span className="font-bold">{context.procedureId}</span>
                {`. I confirm the machine cannot be started. I accept responsibility for this lockout.`}
              </span>
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={detailHref}
              className="inline-flex h-[39px] items-center gap-[7px] rounded-[10px] border border-[rgba(15,23,42,0.14)] bg-[rgba(255,255,255,0.62)] px-4 text-[13px] font-medium text-[#2a3446] transition-colors hover:bg-white"
            >
              <Icon icon="mdi:arrow-left" className="size-3.5" />
              Cancel
            </Link>
            <Button
              type="submit"
              form={LOTO_APPLY_FORM_ID}
              variant="danger"
              disabled={!confirmed}
              className="gap-[7px] rounded-[10px] px-4 py-2.5 text-[13px] font-semibold shadow-[0px_4px_7px_rgba(239,68,68,0.4)] disabled:opacity-50"
            >
              <Icon icon="mdi:lock-outline" className="size-3.5 shrink-0" />
              Confirm Lockout Applied
            </Button>
          </div>
        </div>

        <LotoEnergySourcesPanel sources={context.energySources} />
      </div>
    </div>
  );
}
