"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  REPORT_STEPS,
  type ReportStepId,
} from "@/components/incidents/report/shared/report-incident-data";

export type ReportComingSoonStepProps = Readonly<{
  step: ReportStepId;
  onBack?: () => void;
  onContinue?: () => void;
  className?: string;
}>;

export function ReportComingSoonStep(
  props: Readonly<ReportComingSoonStepProps>,
) {
  const { step, onBack, onContinue, className = "" } = props;
  const stepMeta = REPORT_STEPS.find((item) => item.id === step);

  return (
    <IncidentGlassCard
      paddingClassName="p-[29px]"
      className={["min-w-0 flex-1", className].filter(Boolean).join(" ")}
    >
      <div className="flex min-h-[420px] flex-col gap-7">
        <div>
          <Text
            as="p"
            className="text-ehs-dark-blue text-[10px] font-bold tracking-[1.4px] uppercase"
          >
            {`Step ${String(step)}`}
          </Text>
          <Text
            as="h2"
            className="text-ehs-dark-bg mt-1.5 text-[21.3px] font-bold tracking-[-0.44px]"
          >
            {stepMeta?.title ?? "Next step"}
          </Text>
          <Text as="p" className="text-ehs-gray mt-1.5 text-[12px]">
            {stepMeta?.description ??
              "This step will be available in a following iteration."}
          </Text>
        </div>

        <div className="mt-auto border-t border-[rgba(15,23,42,0.08)] pt-[21px]">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="tertiary"
              onClick={onBack}
              className="rounded-[10px] px-[15px] py-2.5 text-[13px] font-bold"
            >
              <Icon
                icon="mdi:chevron-left"
                className="size-[13px]"
                aria-hidden="true"
              />
              Back
            </Button>
            <div className="min-w-0 flex-1" />
            {step < 5 ? (
              <Button
                type="button"
                variant="primary"
                onClick={onContinue}
                className="rounded-[10px] px-[15px] py-2.5 text-[13px] font-bold shadow-[0px_6px_18px_-6px_#0891a6]"
              >
                Continue
                <Icon
                  icon="mdi:chevron-right"
                  className="size-[13px]"
                  aria-hidden="true"
                />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
