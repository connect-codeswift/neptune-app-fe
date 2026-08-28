"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { REPORT_STEPS, type ReportStepId } from "@/forms/incident-module/index";

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
      paddingClassName="p-7.25"
      className={["min-w-0 flex-1", className].filter(Boolean).join(" ")}
    >
      <div className="flex min-h-105 flex-col gap-7">
        <div>
          <Text
            as="p"
            className="text-ehs-dark-blue text-xs font-bold tracking-wide uppercase"
          >
            {`Step ${String(step)}`}
          </Text>
          <Text
            as="h2"
            className="text-ehs-dark-bg mt-1.5 text-2xl font-semibold tracking-[-0.2px]"
          >
            {stepMeta?.title ?? "Next step"}
          </Text>
          <Text as="p" className="text-ehs-gray mt-1.5 text-sm">
            {stepMeta?.description ??
              "This step will be available in a following iteration."}
          </Text>
        </div>

        <div className="border-ehs-border-ink/8 mt-auto border-t pt-5.25">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="tertiary"
              onClick={onBack}
              className="rounded-2.5 px-3.75 py-2.5 text-sm font-bold"
            >
              <Icon
                icon="mdi:chevron-left"
                className="size-3.25"
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
                className="rounded-2.5 px-3.75 py-2.5 text-sm font-bold shadow-(--ehs-shadow-button-primary-flat)"
              >
                Continue
                <Icon
                  icon="mdi:chevron-right"
                  className="size-3.25"
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
